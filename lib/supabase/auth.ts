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

// Get current user
export async function getCurrentUser() {
  try {
    console.log('getCurrentUser: Starting...');
    const supabase = getSupabase();
    console.log('getCurrentUser: Got supabase instance');

    // First check if we have a session
    console.log('getCurrentUser: Calling getSession...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('getCurrentUser: getSession completed, session:', !!session);

    if (!session) {
      return null;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return null;

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select()
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    return { user, profile: userData };
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
