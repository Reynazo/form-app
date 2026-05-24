import { useEffect, useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Button from './Button'

const STORAGE_KEY = 'form_submissions'
const THEME_KEY = 'app_theme'

const categories = [
  'Consulta general',
  'Soporte técnico',
  'Ventas',
  'Reclamo',
  'Otro',
]

const initialForm = {
  nombre: '',
  email: '',
  telefono: '',
  categoria: '',
  mensaje: '',
}

const themes = {
  light: {
    bg: '#F8F7F4',
    surface: '#FFFFFF',
    surfaceAlt: '#F1EFE8',
    text: '#1A1A18',
    textMuted: '#6B6A65',
    border: '#D8D7D3',
    accent: '#3C3489',
    accentText: '#FFFFFF',
    success: '#3B6D11',
    successBg: '#EAF3DE',
    error: '#E24B4A',
  },
  dark: {
    bg: '#161614',
    surface: '#1F1F1D',
    surfaceAlt: '#2C2C2A',
    text: '#F0EEE8',
    textMuted: '#888780',
    border: '#3A3A38',
    accent: '#AFA9EC',
    accentText: '#1F1F1D',
    success: '#97C459',
    successBg: '#173404',
    error: '#F09595',
  },
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function formatChileanPhone(input) {
  let digits = input.replace(/\D/g, '')

  // Si el usuario escribe o borra sobre el prefijo, evitamos tratar "56" como parte del número local.
  if (digits.startsWith('56')) {
    digits = digits.slice(2)
  }

  digits = digits.slice(0, 9)

  if (digits.length === 0) {
    return ''
  }

  const firstPart = digits.slice(0, 1)
  const secondPart = digits.slice(1, 5)
  const thirdPart = digits.slice(5, 9)

  let formatted = `+56 ${firstPart}`

  if (secondPart) {
    formatted += ` ${secondPart}`
  }

  if (thirdPart) {
    formatted += ` ${thirdPart}`
  }

  return formatted
}

export default function App() {
  const [mode, setMode] = useState('light')
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submissions, setSubmissions] = useState([])
  const [statusMessage, setStatusMessage] = useState('')

  const theme = themes[mode]

  useEffect(() => {
    loadStorage()
  }, [])

  useEffect(() => {
    AsyncStorage.setItem(THEME_KEY, mode).catch(() => {})
  }, [mode])

  const loadStorage = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY)
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setMode(savedTheme)
      }

      const savedData = await AsyncStorage.getItem(STORAGE_KEY)
      if (savedData) {
        setSubmissions(JSON.parse(savedData))
      }
    } catch (error) {
      console.warn('Error loading storage:', error)
    }
  }

  const handleChange = (key, value) => {
    if (key === 'telefono') {
      setForm((prev) => ({
        ...prev,
        telefono: formatChileanPhone(value),
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const validate = () => {
    const errs = {}

    if (!form.nombre.trim()) {
      errs.nombre = 'Campo requerido'
    }

    if (!form.email.trim()) {
      errs.email = 'Campo requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Correo inválido'
    }

    if (!form.telefono.trim()) {
      errs.telefono = 'Campo requerido'
    } else if (!/^\+56 9 \d{4} \d{4}$/.test(form.telefono)) {
      errs.telefono = 'Formato inválido. Usa +56 9 XXXX XXXX'
    }

    if (!form.categoria) {
      errs.categoria = 'Selecciona una categoría'
    }

    if (!form.mensaje.trim()) {
      errs.mensaje = 'Campo requerido'
    }

    return errs
  }

  const saveSubmissions = async (items) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.warn('Error saving storage:', error)
    }
  }

  const handleSubmit = async () => {
    const errs = validate()
    setErrors(errs)

    if (Object.keys(errs).length > 0) {
      return
    }

    const entry = {
      ...form,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    const updated = [entry, ...submissions]
    setSubmissions(updated)
    await saveSubmissions(updated)

    setForm(initialForm)
    setErrors({})
    setStatusMessage('Formulario guardado correctamente')

    setTimeout(() => {
      setStatusMessage('')
    }, 3000)
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>      
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>          
          <Text style={[styles.title, { color: theme.text }]}>Formulario de Contacto</Text>
          <Button 
            mode={mode} 
            setMode={setMode} 
            theme={theme} 
            styles={styles} 
          />
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Nombre completo</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceAlt, color: theme.text, borderColor: theme.border }]}
              placeholder="Ej: María González"
              placeholderTextColor={theme.textMuted}
              value={form.nombre}
              onChangeText={(value) => handleChange('nombre', value)}
            />
            {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceAlt, color: theme.text, borderColor: theme.border }]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={theme.textMuted}
              value={form.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(value) => handleChange('email', value)}
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Teléfono</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceAlt, color: theme.text, borderColor: theme.border }]}
              placeholder="+56 9 1234 5678"
              placeholderTextColor={theme.textMuted}
              value={form.telefono}
              keyboardType="phone-pad"
              maxLength={15}
              onChangeText={(value) => handleChange('telefono', value)}
            />
            {errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Categoría</Text>
            <View style={styles.categoryContainer}>
              {categories.map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor:
                        form.categoria === item ? theme.accent : theme.surfaceAlt,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => handleChange('categoria', item)}
                >
                  <Text
                    style={{
                      color: form.categoria === item ? theme.accentText : theme.text,
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.categoria && <Text style={styles.error}>{errors.categoria}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Mensaje</Text>
            <TextInput
              style={[
                styles.input,
                styles.textarea,
                { backgroundColor: theme.surfaceAlt, color: theme.text, borderColor: theme.border },
              ]}
              placeholder="Escribe tu mensaje aquí..."
              placeholderTextColor={theme.textMuted}
              value={form.mensaje}
              multiline
              numberOfLines={4}
              onChangeText={(value) => handleChange('mensaje', value)}
            />
            {errors.mensaje && <Text style={styles.error}>{errors.mensaje}</Text>}
          </View>

          <Pressable
            style={[styles.submitButton, { backgroundColor: theme.accent }]}
            onPress={handleSubmit}
          >
            <Text style={[styles.submitButtonText, { color: theme.accentText }]}>Guardar formulario</Text>
          </Pressable>

          {statusMessage ? (
            <View style={[styles.toast, { backgroundColor: theme.successBg }]}>              
              <Text style={[styles.toastText, { color: theme.success }]}>{statusMessage}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.records}>          
          <Text style={[styles.subtitle, { color: theme.text }]}>Registros guardados</Text>
          {submissions.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay registros aún.</Text>
          ) : (
            submissions.map((item) => (
              <View
                key={item.id}
                style={[styles.recordCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
              >
                <Text style={[styles.recordName, { color: theme.text }]}>{item.nombre}</Text>
                <Text style={[styles.recordText, { color: theme.textMuted }]}>{item.email}</Text>
                <Text style={[styles.recordText, { color: theme.textMuted }]}>{item.telefono}</Text>
                <Text style={[styles.recordText, { color: theme.textMuted }]}>{item.categoria}</Text>
                <Text style={[styles.recordDate, { color: theme.textMuted }]}>{formatDate(item.createdAt)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 18,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 14,
  },
  field: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 14,
    marginRight: 10,
    marginBottom: 10,
  },
  submitButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  toast: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  toastText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    marginTop: 6,
    color: '#E24B4A',
    fontSize: 13,
  },
  records: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  recordCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  recordText: {
    fontSize: 14,
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 12,
    marginTop: 8,
  },
})

