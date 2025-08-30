import { UserProfile } from '@/components/profile/UserProfile';

export default function ProfilePage({ 
  params 
}: { 
  params: { username: string } 
}) {
  return <UserProfile username={params.username} />;
}