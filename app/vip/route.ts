import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 1. El radar lee la baliza de identidad (Quién es la agencia)
  const inviteCode = searchParams.get('inv');
  
  // 2. El radar lee la baliza de origen (Viene por WhatsApp o por Email)
  const sourceCode = searchParams.get('src'); 

  // 3. Redirigimos al cliente INSTANTÁNEAMENTE a su espectacular portada
  const response = NextResponse.redirect(new URL('/?vip=true', request.url));
  
  // 4. Mientras vuela hacia la portada, le pegamos las cookies invisibles
  if (inviteCode) {
    // Guardamos quién lo invitó (dura 7 días)
    response.cookies.set('stratos_vip_invite', inviteCode, { 
        maxAge: 60 * 60 * 24 * 7, 
        path: '/' 
    });
    
    // Guardamos el arma que usamos (wa o em)
    if (sourceCode) {
        response.cookies.set('stratos_vip_source', sourceCode, { 
            maxAge: 60 * 60 * 24 * 7, 
            path: '/' 
        });
    }
  }
  
  return response;
}