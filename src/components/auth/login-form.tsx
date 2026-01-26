'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'VISUALIZER',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo.png');
  const router = useRouter();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        toast({ title: 'Inicio de sesión', description: '¡Bienvenido al sistema!' });
        router.push('/');
      } else {
        toast({ variant: 'destructive', title: 'Error de login', description: data.error || 'Error en el login' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error de conexión', description: 'No se pudo conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Cuenta creada', description: 'Usuario creado exitosamente' });
        // Cambiar a la pestaña de login
        setLoginData({
          email: registerData.email,
          password: registerData.password
        });
      } else {
        toast({ variant: 'destructive', title: 'Error de registro', description: data.error || 'Error en el registro' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error de conexión', description: 'No se pudo conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'repeating-linear-gradient(to right, rgba(255,255,255,0.6) 0 1px, transparent 1px 40px), repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0 1px, transparent 1px 40px)'}} />
        <div className="absolute -inset-1 opacity-20 animate-[spin_30s_linear_infinite]" style={{background: 'conic-gradient(from 90deg at 50% 50%, rgba(147,51,234,0.15), rgba(59,130,246,0.15), rgba(16,185,129,0.1), rgba(147,51,234,0.15))'}} />
        <div className="absolute inset-x-0 top-1/3 h-48 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-2xl" />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src={logoSrc} alt="Logo" width={112} height={112} className="mx-auto mb-4 rounded-lg" onError={() => setLogoSrc('/logo.svg')} />
          <div className="text-left text-gray-300 text-sm bg-white/5 border border-white/10 rounded-lg p-4 mx-auto max-w-md">
            <p>
              <strong>ProXis</strong> es un sistema integral de gestión de construcción diseñado para empresas constructoras, contratistas y desarrolladores inmobiliarios. Ofrece una solución completa para administrar proyectos, controlar presupuestos, gestionar recursos y generar reportes en tiempo real.
            </p>
          </div>
        </div>

        <Card className="rounded-2xl bg-white/10 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-center">Bienvenido</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Inicia sesión o crea una nueva cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="login" className="text-white data-[state=active]:bg-white/20">
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="register" className="text-white data-[state=active]:bg-white/20">
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-white">Nombre</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Tu nombre"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-white">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone" className="text-white">Teléfono</Label>
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+504 XXXX-XXXX"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-role" className="text-white">Tipo de Cuenta</Label>
                    <Select value={registerData.role} onValueChange={(value) => setRegisterData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="MANAGER">Gerente</SelectItem>
                        <SelectItem value="ACCOUNTANT">Contador</SelectItem>
                        <SelectItem value="VISUALIZER">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-white">Contraseña</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Sistema desarrollado por - Byron Landero
          </p>
        </div>
      </div>
    </div>
  );
}