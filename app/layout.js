import Header from '../components/Header';
import { getCurrentUser, getProfile } from '../lib/auth';

export default async function RootLayout({ children}){
    const user = await getCurrentUser();
    const profile = await getProfile();

    return (
        <html lang="en">
        <head ><title>My App</title></head>
        <body style={{ margin: 0 }}>
            <Header user={user} profile={profile} />
            {children}
        </body>
        </html>
    )
}
