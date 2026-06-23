'use strict';

// usage: npm run admin:create -- <username> <password> [firstName] [lastName] [email]

const db = require('../src/db');
const authService = require('../src/services/authService');
const logger = require('../src/utils/logger');

async function main() {
  const [username, password, firstName, lastName, email] = process.argv.slice(2);

  if (!username || !password) {
    logger.error('Usage: npm run admin:create -- <username> <password> [firstName] [lastName] [email]');
    process.exitCode = 1;
    return;
  }

  const existing = await authService.findAccountByUsername(username);
  if (existing) {
    logger.error(`An account with username "${username}" already exists.`);
    process.exitCode = 1;
    return;
  }

  const { accountId, adminId } = await authService.createAdminAccount({
    username,
    password,
    profile: { firstName, lastName, email },
  });

  logger.info(`Created admin "${username}" (account_id ${accountId}, admin_id ${adminId}).`);
}

main()
  .catch((err) => {
    logger.error('Failed to create admin:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
