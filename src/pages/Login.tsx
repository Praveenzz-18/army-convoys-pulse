import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, Lock, Mail, Users } from 'lucide-react';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    login,
    register,
    isAuthenticated,
    loading: authLoading
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
          toast({
            title: 'Welcome Back!',
            description: 'Successfully logged in to Army Logistics Command Center.'
          });
          navigate('/dashboard');
        }
      } else {
        const success = await register(email, password, name, role);
        if (success) {
          toast({
            title: 'Account Created',
            description: `Welcome to the unit, ${name}. You are registered as ${role === 'commando' ? 'a Commando' : 'a Soldier'}.`
          });
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: mode === 'login' ? 'Login Failed' : 'Registration Failed',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      </div>

      <Card className="w-full max-w-md mx-4 glass-card border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Army Logistics' : 'Join the Unit'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Command Center Access' : 'Create your secure personnel profile'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mode Toggle */}
          <div className="flex bg-muted p-1 rounded-lg mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'login' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'signup' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" placeholder="E.g. John Doe" value={name} onChange={e => setName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Personnel Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={role === 'user' ? 'default' : 'outline'}
                      onClick={() => setRole('user')}
                      className="w-full"
                    >
                      Soldier
                    </Button>
                    <Button
                      type="button"
                      variant={role === 'commando' ? 'default' : 'outline'}
                      onClick={() => setRole('commando')}
                      className="w-full"
                    >
                      Commando
                    </Button>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email / Service ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="your.name@army.mil.in" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Processing...' : mode === 'login' ? 'Access Command Center' : 'Establish Profile'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <p>Demo credentials: any registered email + password</p>
            ) : (
              <p>Enter your details to create a secure Firebase account.</p>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Credits */}
      <div className="absolute bottom-4 text-center text-sm text-muted-foreground">
        Developed by <span className="text-primary font-semibold">​techTitans</span>
      </div>
    </div>;
};
export default Login;