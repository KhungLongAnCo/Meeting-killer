import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function getUserApiKey(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    const username = cookieStore.get('auth_user')?.value;
    
    if (username) {
      const user = await prisma.user.findUnique({
        where: { username },
        include: { setting: true }
      });
      
      if (user?.setting?.openaiApiKey) {
        return user.setting.openaiApiKey;
      }
    }
  } catch (err) {
    console.error("Failed to get user API key", err);
  }
  
  return process.env.OPENAI_API_KEY;
}
