import { useState, useEffect } from "react";

const STORAGE_KEY = "form_submissions";

const themes = {
  light: {
    bg: "#F8F7F4",
    surface: "#FFFFFF",
    surfaceAlt: "#F1EFE8",
    text: "#1A1A18",
    textMuted: "#6B6A65",
    border: "rgba(0,0,0,0.12)",
    accent: "#3C3489",
    accentBg: "#EEEDFE",
    accentText: "#26215C",
    danger: "#E24B4A",
    dangerBg: "#FCEBEB",
    success: "#3B6D11",
    successBg: "#EAF3DE",
  },

  dark: {
    bg: "#161614",
    surface: "#1F1F1D",
    surfaceAlt: "#2C2C2A",
    text: "#F0EEE8",
    textMuted: "#888780",
    border: "rgba(255,255,255,0.1)",
    accent: "#AFA9EC",
    accentBg: "#26215C",
    accentText: "#EEEDFE",
    danger: "#F09595",
    dangerBg: "#501313",
    success: "#97C459",
    successBg: "#173404",
  },
};

const FIELDS = [
  {
    id: "nombre",
    label: "Nombre completo",
    type: "text",
    placeholder: "Ej: María González",
    required: true,
  },

  {
    id: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "correo@ejemplo.com",
    required: true,
  },

  {
    id: "telefono",
    label: "Teléfono",
    type: "tel",
    placeholder: "+56 9 1234 5678",
    required: false,
  },

  {
    id: "categoria",
    label: "Categoría",
    type: "select",
    required: true,

    options: [
      "Consulta general",
      "Soporte técnico",
      "Ventas",
      "Reclamo",
      "Otro",
    ],
  },

  {
    id: "mensaje",
    label: "Mensaje",
    type: "textarea",
    placeholder: "Escribe tu mensaje aquí...",
    required: true,
  },
];

function formatDate(iso) {
  return new Date(iso).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function App() {
  const [mode, setMode] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    categoria: "",
    mensaje: "",
  });

  const [errors, setErrors] = useState({});

  const [submissions, setSubmissions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  const t = themes[mode];

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const validate = () => {
    const errs = {};

    if (!form.nombre.trim()) {
      errs.nombre = "Campo requerido";
    }

    if (!form.email.trim()) {
      errs.email = "Campo requerido";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      errs.email = "Correo inválido";
    }

    if (!form.categoria) {
      errs.categoria = "Selecciona una categoría";
    }

    if (!form.mensaje.trim()) {
      errs.mensaje = "Campo requerido";
    }

    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();

    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    const entry = {
      ...form,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    const updated = [entry, ...submissions];

    setSubmissions(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    setForm({
      nombre: "",
      email: "",
      telefono: "",
      categoria: "",
      mensaje: "",
    });

    setToast("Formulario guardado correctamente");

    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (id, value) => {
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        padding: 40,
        fontFamily: "Arial",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 550,
          margin: "0 auto",
          background: t.surface,
          padding: 30,
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          border: `1px solid ${t.border}`,
        }}
      >
        <h1
          style={{
            marginBottom: 25,
            fontSize: 28,
            textAlign: "center",
          }}
        >
          Formulario de Contacto
        </h1>

        {/* BOTON NUEVO */}
        <button
          onClick={() =>
            setMode((m) =>
              m === "light" ? "dark" : "light"
            )
          }
          style={{
            marginBottom: 25,
            width: "100%",
            padding: "14px 18px",
            border: `1px solid ${t.border}`,
            borderRadius: "999px",
            cursor: "pointer",

            background:
              mode === "light"
                ? "linear-gradient(135deg, #ffffff, #ede9fe)"
                : "linear-gradient(135deg, #1f1f1d, #312e81)",

            color: t.text,
            fontWeight: "bold",
            fontSize: 15,

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            transition: "all 0.3s ease",

            boxShadow:
              "0 8px 20px rgba(0,0,0,0.15)",
          }}
        >
          <span>
            {mode === "light"
              ? "Cambiar a modo oscuro"
              : "Cambiar a modo claro"}
          </span>

          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background:
                mode === "light"
                  ? "#FFD166"
                  : "#6366F1",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              fontSize: 18,

              boxShadow:
                "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            {mode === "light" ? "☀️" : "🌙"}
          </span>
        </button>

        {FIELDS.map((field) => (
          <div
            key={field.id}
            style={{ marginBottom: 18 }}
          >
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontWeight: "bold",
              }}
            >
              {field.label}
            </label>

            {field.type === "select" ? (
              <select
                value={form[field.id]}
                onChange={(e) =>
                  handleChange(
                    field.id,
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${t.border}`,
                  background: t.surfaceAlt,
                  color: t.text,
                }}
              >
                <option value="">
                  Selecciona
                </option>

                {field.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                value={form[field.id]}
                onChange={(e) =>
                  handleChange(
                    field.id,
                    e.target.value
                  )
                }
                placeholder={field.placeholder}
                rows={4}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${t.border}`,
                  background: t.surfaceAlt,
                  color: t.text,
                }}
              />
            ) : (
              <input
                type={field.type}
                value={form[field.id]}
                onChange={(e) =>
                  handleChange(
                    field.id,
                    e.target.value
                  )
                }
                placeholder={field.placeholder}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${t.border}`,
                  background: t.surfaceAlt,
                  color: t.text,
                }}
              />
            )}

            {errors[field.id] && (
              <p
                style={{
                  color: "red",
                  fontSize: 12,
                  marginTop: 5,
                }}
              >
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: 14,
            border: "none",
            borderRadius: 12,
            background: t.accent,
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 15,
            marginTop: 10,
          }}
        >
          Guardar formulario
        </button>

        {toast && (
          <div
            style={{
              marginTop: 20,
              background: t.successBg,
              color: t.success,
              padding: 12,
              borderRadius: 10,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {toast}
          </div>
        )}

        <div style={{ marginTop: 35 }}>
          <h2
            style={{
              marginBottom: 15,
            }}
          >
            Registros Guardados
          </h2>

          {submissions.length === 0 && (
            <p
              style={{
                color: t.textMuted,
              }}
            >
              No hay registros aún.
            </p>
          )}

          {submissions.map((s) => (
            <div
              key={s.id}
              style={{
                marginBottom: 12,
                padding: 15,
                borderRadius: 12,
                background: t.surfaceAlt,
                border: `1px solid ${t.border}`,
              }}
            >
              <strong
                style={{
                  fontSize: 16,
                }}
              >
                {s.nombre}
              </strong>

              <p>{s.email}</p>

              <p>{s.categoria}</p>

              <p
                style={{
                  fontSize: 12,
                  color: t.textMuted,
                  marginTop: 5,
                }}
              >
                {formatDate(s.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}