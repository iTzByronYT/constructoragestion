import 'next';

declare module 'next' {
  interface NextApiRequest {
    // Propiedades personalizadas comunes
    user?: {
      id: string;
      email: string;
    };
  }

  interface NextApiResponse<T = any> {
    // Métodos personalizados comunes
    json: (body: T) => void;
    status: (code: number) => NextApiResponse<T>;
    end: () => void;
  }
}
