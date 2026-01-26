const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Verificar si el archivo .env existe
const envPath = '.env';
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Archivo .env encontrado. Contenido actual:');
  console.log('--- INICIO DEL ARCHIVO .env ---');
  console.log(envContent);
  console.log('--- FIN DEL ARCHIVO .env ---\n');
} else {
  console.log('ℹ️ No se encontró un archivo .env. Se creará uno nuevo.\n');
}

// Preguntar por las variables necesarias
const questions = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    message: 'Ingresa la URL de tu proyecto Supabase (NEXT_PUBLIC_SUPABASE_URL):',
    default: process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    message: 'Ingresa la clave anónima de Supabase (NEXT_PUBLIC_SUPABASE_ANON_KEY):',
    default: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  },
  {
    name: 'SUPABASE_SERVICE_KEY',
    message: 'Ingresa la clave de servicio de Supabase (SUPABASE_SERVICE_KEY):',
    default: process.env.SUPABASE_SERVICE_KEY || ''
  }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    // Todas las preguntas han sido respondidas, guardar el archivo
    saveEnvFile();
    return;
  }

  const q = questions[index];
  
  rl.question(q.message + ' ', (answer) => {
    answers[q.name] = answer || q.default;
    askQuestion(index + 1);
  });
}

function saveEnvFile() {
  let newEnvContent = envContent;
  
  // Actualizar o agregar cada variable
  for (const [key, value] of Object.entries(answers)) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    const newLine = `${key}=${value}`;
    
    if (regex.test(newEnvContent)) {
      // Actualizar variable existente
      newEnvContent = newEnvContent.replace(regex, newLine);
    } else {
      // Agregar nueva variable
      newEnvContent += `\n${newLine}`;
    }
  }
  
  // Guardar el archivo
  fs.writeFileSync(envPath, newEnvContent.trim());
  
  console.log('\n✅ Archivo .env actualizado correctamente.');
  console.log('\n🔐 Para que los cambios surtan efecto, por favor ejecuta:');
  console.log('   source .env\n');
  
  rl.close();
}

// Iniciar el proceso de preguntas
console.log('🚀 Configuración de variables de entorno\n');
askQuestion(0);
