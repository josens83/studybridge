import { getSupabase } from './client';

export interface SignUpData {
  email: string;
  password: string;
  nickname: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up with email
export async function signUp({ email, password, nickname }: SignUpData) {
  const supabase = getSupabase();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  // Create user profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      nickname,
      is_anonymous: false,
      coins: 500, // Welcome bonus
      points: 100,
    })
    .select()
    .single();

  if (userError) throw userError;

  return { user: authData.user, profile: userData };
}

// Sign in with email
export async function signIn({ email, password }: SignInData) {
  const supabase = getSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('Failed to sign in');

  // Get user profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select()
    .eq('id', data.user.id)
    .single();

  if (userError) throw userError;

  return { user: data.user, profile: userData };
}

// Sign in anonymously
export async function signInAnonymously() {
  const supabase = getSupabase();

  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to sign in anonymously');

  // Generate random nickname
  const randomNumber = Math.floor(Math.random() * 9000 + 1000);
  const nickname = `익명${randomNumber}`;

  // Create user profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      nickname,
      is_anonymous: true,
      coins: 300, // Reduced bonus for anonymous users
      points: 50,
    })
    .select()
    .single();

  if (userError) {
    // User might already exist, try to fetch
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('id', authData.user.id)
      .single();

    if (existingUser) {
      return { user: authData.user, profile: existingUser };
    }

    throw userError;
  }

  return { user: authData.user, profile: userData };
}

// Sign out
export async function signOut() {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user with timeout
export async function getCurrentUser() {
  try {
    console.log('getCurrentUser: Starting...');

    // Create a promise that times out after 5 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('getCurrentUser timeout after 5s')), 5000);
    });

    const getUserPromise = (async () => {
      const supabase = getSupabase();
      console.log('getCurrentUser: Got supabase instance');

      // First check if we have a session
      console.log('getCurrentUser: Calling getSession...');
      const sessionResult = await supabase.auth.getSession();
      console.log('getCurrentUser: getSession completed, session:', !!sessionResult.data.session);

      if (!sessionResult.data.session) {
        console.log('getCurrentUser: No session found, returning null');
        return null;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('getCurrentUser: authError:', authError);
        throw authError;
      }
      if (!user) {
        console.log('getCurrentUser: No user found, returning null');
        return null;
      }

      console.log('getCurrentUser: User found, fetching profile...');

      // Get user profile - but don't fail if it doesn't exist
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select()
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create a basic one from auth user
      if (userError || !userData) {
        console.log('User profile not found, creating basic profile from auth user');

        // Return a basic profile structure
        const basicProfile = {
          id: user.id,
          email: user.email,
          nickname: user.email?.split('@')[0] || `User${user.id.substring(0, 4)}`,
          is_anonymous: !user.email,
          coins: 0,
          points: 0,
          subscription_tier: 'free' as const,
          created_at: user.created_at,
          updated_at: new Date().toISOString(),
        };

        return { user, profile: basicProfile };
      }

      console.log('getCurrentUser: Profile found, returning user data');
      return { user, profile: userData };
    })();

    // Race between the actual call and the timeout
    const result = await Promise.race([getUserPromise, timeoutPromise]);
    return result as Awaited<typeof getUserPromise>;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

// Get user profile by ID
export async function getUserProfile(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<{
  nickname: string;
  avatar_url: string;
}>) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
