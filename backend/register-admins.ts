import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execPromise = promisify(exec);

const API_URL = 'http://localhost:5000/auth/register/admin';
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD;

interface Admin {
  username: string;
  email: string;
  password?: string;
}

interface RegistrationResult {
  success: boolean;
  admin: string;
  response?: string;
  error?: string;
}

// List of admins
const admins: Admin[] = [
  {
    username: 'benardonu1',
    email: 'benardonu1@gmail.com',
    password: DEFAULT_PASSWORD
  },
  {
    username: 'jenoladev',
    email: 'jenoladev@gmail.com',
    password: DEFAULT_PASSWORD
  },
  {
    username: 'ogunodemarvellous',
    email: 'ogunodemarvellous@gmail.com',
    password: DEFAULT_PASSWORD
  },
  {
    username: 'navigator',
    email: 'navigatorabraham17@gmail.com',
    password: DEFAULT_PASSWORD
  },
  {
    username: 'rokeeb',
    email: 'rokeeb@gmail.com',
    password: DEFAULT_PASSWORD
  },
  {
    username: 'lexicon',
    email: 'lexicon@gmail.com',
    password: DEFAULT_PASSWORD
  }
];

// Register a single admin
async function registerAdmin(admin: Admin): Promise<RegistrationResult> {
  const payload = {
    username: admin.username,
    email: admin.email,
    password: admin.password
  };

  const curlCommand = `curl -X POST ${API_URL} -H "Content-Type: application/json" -d "${JSON.stringify(payload).replace(/"/g, '\\"')}"`;

  try {
    const { stdout } = await execPromise(curlCommand);
    return { success: true, admin: admin.username, response: stdout };
  } catch (error: any) {
    return { success: false, admin: admin.username, error: error.message };
  }
}

// Main function
async function registerAllAdmins() {
  console.log('Starting admin registration...\n');
  console.log(`Found ${admins.length} admins to register\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < admins.length; i++) {
    const admin = admins[i];
    console.log(`[${i + 1}/${admins.length}] Registering: ${admin.username} (${admin.email})...`);

    const result = await registerAdmin(admin);

    if (result.success) {
      successCount++;
      console.log(`✓ Success: ${result.admin}`);
      console.log(`Response: ${result.response}`);
    } else {
      failCount++;
      console.log(`✗ Failed: ${result.admin} - ${result.error}`);
    }

    console.log('---');

    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=== Admin Registration Complete ===');
  console.log(`Total: ${admins.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

// Run the script
registerAllAdmins().catch(console.error);