import { Link } from 'react-router-dom';
import { UserCheck, History, Camera, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { useAuthContext } from '@/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuthContext();

  const hasFaceRegistered = !!user?.faceImageUrl;
  const hasBlinkRegistered = !!user?.blinkSequence;
  const isFullyRegistered = hasFaceRegistered && hasBlinkRegistered;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">
            {isFullyRegistered 
              ? 'You\'re all set! Use Check In to record your attendance.'
              : 'Complete your biometric registration to start checking in.'}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className={hasFaceRegistered ? 'border-primary/50 bg-primary/5' : ''}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                hasFaceRegistered ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Camera className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  Face ID
                  {hasFaceRegistered && <CheckCircle className="w-4 h-4 text-primary" />}
                </CardTitle>
                <CardDescription>
                  {hasFaceRegistered ? 'Registered' : 'Not registered'}
                </CardDescription>
              </div>
            </CardHeader>
            {!hasFaceRegistered && (
              <CardContent>
                <Link to="/register-face">
                  <Button variant="outline" className="w-full">Register Face</Button>
                </Link>
              </CardContent>
            )}
          </Card>

          <Card className={hasBlinkRegistered ? 'border-primary/50 bg-primary/5' : ''}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                hasBlinkRegistered ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Eye className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  Double Blink
                  {hasBlinkRegistered && <CheckCircle className="w-4 h-4 text-primary" />}
                </CardTitle>
                <CardDescription>
                  {hasBlinkRegistered ? 'Registered' : 'Not registered'}
                </CardDescription>
              </div>
            </CardHeader>
            {!hasBlinkRegistered && hasFaceRegistered && (
              <CardContent>
                <Link to="/register-blink">
                  <Button variant="outline" className="w-full">Register Blink</Button>
                </Link>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        {isFullyRegistered && (
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/check-in">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserCheck className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Check In Now</h3>
                    <p className="text-sm text-muted-foreground">Verify your face and blink</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/history">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                    <History className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">View History</h3>
                    <p className="text-sm text-muted-foreground">See your attendance records</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
