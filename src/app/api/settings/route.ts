import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type SystemSettings = {
  id?: string;
  language: string;
  currency: string;
  exchangeRate: number;
  timezone: string;
  dateFormat: string;
  notifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  autoBackup: boolean;
  backupFrequency: string;
};

const defaultSettings: SystemSettings = {
  language: 'es',
  currency: 'HNL',
  exchangeRate: 24.5,
  timezone: 'America/Tegucigalpa',
  dateFormat: 'DD/MM/YYYY',
  notifications: true,
  emailAlerts: true,
  darkMode: false,
  autoBackup: true,
  backupFrequency: 'daily'
};

export async function GET() {
  try {
    // Usar SQL directo
    const settings = await db.$queryRaw`SELECT * FROM system_settings LIMIT 1`;
    
    if (!settings || (Array.isArray(settings) && settings.length === 0)) {
      // Crear configuración por defecto
      await db.$executeRaw`
        INSERT INTO system_settings (
          language, currency, exchangeRate, timezone, dateFormat,
          notifications, emailAlerts, darkMode, autoBackup, backupFrequency
        ) VALUES (
          ${defaultSettings.language}, 
          ${defaultSettings.currency}, 
          ${defaultSettings.exchangeRate}, 
          ${defaultSettings.timezone}, 
          ${defaultSettings.dateFormat},
          ${defaultSettings.notifications ? 1 : 0}, 
          ${defaultSettings.emailAlerts ? 1 : 0}, 
          ${defaultSettings.darkMode ? 1 : 0}, 
          ${defaultSettings.autoBackup ? 1 : 0}, 
          ${defaultSettings.backupFrequency}
        )
      `;
      
      const newSettings = await db.$queryRaw`SELECT * FROM system_settings LIMIT 1`;
      return NextResponse.json(Array.isArray(newSettings) ? newSettings[0] : newSettings);
    }
    
    return NextResponse.json(Array.isArray(settings) ? settings[0] : settings);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const exchangeRate = parseFloat(data.exchangeRate);
    
    if (isNaN(exchangeRate) || exchangeRate <= 0) {
      return NextResponse.json(
        { error: 'La tasa de cambio debe ser un número mayor a 0' },
        { status: 400 }
      );
    }
    
    const settingsData = {
      language: String(data.language || 'es'),
      currency: String(data.currency || 'HNL'),
      exchangeRate: exchangeRate,
      timezone: String(data.timezone || 'America/Tegucigalpa'),
      dateFormat: String(data.dateFormat || 'DD/MM/YYYY'),
      notifications: Boolean(data.notifications),
      emailAlerts: Boolean(data.emailAlerts),
      darkMode: Boolean(data.darkMode),
      autoBackup: Boolean(data.autoBackup),
      backupFrequency: String(data.backupFrequency || 'daily')
    };
    
    // Verificar si ya existe una configuración
    const existing = await db.$queryRaw`SELECT id FROM system_settings LIMIT 1`;
    const exists = Array.isArray(existing) ? existing.length > 0 : !!existing;
    
    if (exists) {
      // Actualizar configuración existente
      const result = await db.$queryRaw`
        UPDATE system_settings 
        SET 
          language = ${settingsData.language},
          currency = ${settingsData.currency},
          exchangeRate = ${settingsData.exchangeRate},
          timezone = ${settingsData.timezone},
          dateFormat = ${settingsData.dateFormat},
          notifications = ${settingsData.notifications ? 1 : 0},
          emailAlerts = ${settingsData.emailAlerts ? 1 : 0},
          darkMode = ${settingsData.darkMode ? 1 : 0},
          autoBackup = ${settingsData.autoBackup ? 1 : 0},
          backupFrequency = ${settingsData.backupFrequency},
          updatedAt = CURRENT_TIMESTAMP
        RETURNING *
      `;
      // Asegurarnos de que tenemos al menos un resultado
      const updated = Array.isArray(result) ? result[0] : result;
      return NextResponse.json(updated);
    } else {
      // Crear nueva configuración
      const result = await db.$queryRaw`
        INSERT INTO system_settings (
          language, currency, exchangeRate, timezone, dateFormat,
          notifications, emailAlerts, darkMode, autoBackup, backupFrequency
        ) VALUES (
          ${settingsData.language}, 
          ${settingsData.currency}, 
          ${settingsData.exchangeRate}, 
          ${settingsData.timezone}, 
          ${settingsData.dateFormat},
          ${settingsData.notifications ? 1 : 0}, 
          ${settingsData.emailAlerts ? 1 : 0}, 
          ${settingsData.darkMode ? 1 : 0}, 
          ${settingsData.autoBackup ? 1 : 0}, 
          ${settingsData.backupFrequency}
        )
        RETURNING *
      `;
      // Asegurarnos de que tenemos al menos un resultado
      const newSettings = Array.isArray(result) ? result[0] : result;
      return NextResponse.json(newSettings);
    }
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    return NextResponse.json(
      { 
        ...defaultSettings,
        error: 'Error al guardar la configuración. Se han aplicado valores por defecto.'
      },
      { status: 500 }
    );
  }
}
