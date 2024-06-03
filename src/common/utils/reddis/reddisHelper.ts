const cardKey = (id) => `card-${id}`;
const userKey = (id) => `user-${id}`;
const transactionKey = (id) => `transaction-${id}`;

export const reddisHelper = { cardKey, userKey, transactionKey };
