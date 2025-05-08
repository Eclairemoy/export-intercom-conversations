import pkg from "intercom-client";
const { Client } = pkg;
import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();

// If there are only 20 requests remaining, sleep for 10s
const RATE_LIMIT_REMAINING = 20;
const RATE_LIMIT_SLEEP_TIME = 10;

// Your Intercom API access token
const INTERCOM_TOKEN = process.env.INTERCOM_TOKEN;

// Create a new Intercom client
const client = new Client({ tokenAuth: { token: INTERCOM_TOKEN } });

// Sets the resting time for the rate limit check
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// A function that checks the rate limit remaining provided in the response header
const checkRateLimit = async (response) => {
  if (response.headers.get("X-RateLimit-Remaining") < RATE_LIMIT_REMAINING) {
    console.log("sleeping for 10s");
    await sleep(RATE_LIMIT_SLEEP_TIME);
  }
};

// Function that fetches the list of 5 conversations data from a request
async function fetchConversationsData(params) {
  try {
    const query = new URLSearchParams(params).toString();

    const response = await fetch(`https://api.intercom.io/conversations/2031`, {
      method: "GET",
      headers: {
        "Intercom-Version": "Unstable",
        Authorization: `Bearer ${INTERCOM_TOKEN}`,
      },
    });

    const conversations = await response.json();
    await checkRateLimit(response);
    return conversations;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Rethrow to handle it in the caller
  }
}

async function fetchAllConversationsData() {
  /* Specify the initial parameters of 5 conversations per page
  You can adjust this value to your needs */
  let params = { per_page: 5 };

  // While there are more pages of data, fetch and process each page
  while (params) {
    // Call the function to fetch the batch of 5 conversations
    const conversations = await fetchConversationsData(params);
    console.log(conversations);

    // Get all of the conversation parts and format all of the conversations in the batch
    const allConversations = await Promise.all(
      conversations.conversation_parts.conversation_parts.map(
        (conversation) => {
          return packageConversations(conversation);
        },
      ),
    );

    // Convert formatted conversations to JSON
    let data = JSON.stringify(allConversations);

    // Write the JSON to a file
    const filename = `conversations_${Date.now()}.json`;
    fs.writeFileSync(filename, data);

    // If there are no more pages, set the params to null and exit the loop
    if (!conversations.pages.next) {
      params = null;
      break; // Exit loop if no more data
    }

    // If there are more pages, update the params to fetch the next page
    params.starting_after = conversations.pages.next.starting_after; // Update startingAfter for the next request
  }
}

// helper function for getAllConversations
async function getIndividualConversation(conversation_part) {
  console.log(conversation_part);
  const conversationResponse = await client.conversations.find({
    id: conversationId,
    inPlainText: true,
  });

  return conversationResponse;
}

function createMessage(...args) {
  return {
    author_id: args[0],
    author_email: args[1],
    created_at: args[2],
    body: args[3],
  };
}

async function packageConversations(conversationId) {
  let individualConversation = await getIndividualConversation(
    conversationId,
  ).then((data) => {
    return data;
  });

  console.log(individualConversation.source);

  let conversationObj = {};

  conversationObj.conversationID = individualConversation.id;
  conversationObj.participants = [
    individualConversation.source.author.id,
    individualConversation.admin_assignee_id,
  ];

  let messages = [
    createMessage(
      individualConversation.source.author.id,
      individualConversation.source.author.email,
      individualConversation.created_at,
      individualConversation.source.body,
    ),
  ];

  const conversationParts =
    individualConversation.conversation_parts.conversation_parts.map((part) => {
      messages.push(
        createMessage(
          part.author.id,
          part.author.email,
          part.created_at,
          part.body,
        ),
      );
    });
  conversationObj.messages = messages;
  return conversationObj;
}

//Run
fetchAllConversationsData()
  .then(() => {
    console.log("Fetched all data successfully!");
  })
  .catch((error) => {
    console.error("Failed to fetch all data:", error);
  });
