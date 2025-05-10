# 🚀 Guía para levantar el proyecto NestJS + Prisma después de clonar

Sigue estos pasos para instalar y ejecutar este proyecto en una nueva máquina o entorno local.

---

## 📥 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

```

## 2. Instalar dependencias

```bash
npm install
```

## 3.Configurar variables de entorno
```bash
cp .env.example .env
```

## 4.Generar cliente de prisma
```bash
npx prisma generate
```

## 5.Ejecutar migraciones (si aplica)
```bash
npx prisma generate
```

## 6. Levantar la aplicacion
```bash
npm run start:dev

## En produccion
npm run build
npm run start:prod

```
