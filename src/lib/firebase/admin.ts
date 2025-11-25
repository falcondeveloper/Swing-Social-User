import admin from "firebase-admin";


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "swing-social-website",
      clientEmail: "firebase-adminsdk-fbsvc@swing-social-website.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCgdk1iYzRfniSI\npmIo8BU3mrarKlkHJY/A7XGDsnue7KXbXUwj7UuglM2vpnkwkj0mhZZnF0HeaqyP\nEamDLtVgHh9OXNof2/v9IPi6EYJhqt/9hdsMnk6pDRVwGT5BSbIWUtITAAW1ZyKP\nv0Nr/02Jz8M24v+tHOocW0NKOukb/JZ2HLn6GoaB3SOqZ/WRwSnd1KozF3xYhT9X\ntq30Eegaw9b+4rcDN8MrkkFI47kKL7Et2UcnEdujkoPLnjYEEn0mcmaRVnaGaSWQ\nDfmV9Y/Y7NFI2J5SlR6sb7sZElaJurlB27Nzoks/y66J4PnTuZpA2NVbfe8eDTkY\nH9qbswEnAgMBAAECggEALFRyjYddrTrZ2fypaqjlG6783y28WbqZS9HtRdZ1y5KS\nQZe1VMmWVp81cdzaZz5HcZB/XCyzMFilIoNdItY58atwt6v0QM/7/lLxFCqJLCVS\na05jFUnY7mAkd4spxUywS/WGfuRHL3X2OOM8o6XtDHEe+9dbjj5KORpHbUb4JphC\nE5p5PKj2FrFDTopGm9V3a+rhBEkiNl2YhJQq++Ycq3pytx6CIKdGhIWRtSSGZa4c\nOiXDQGGoAX8Xp9gr1vDSiHOjksk8zOFpplPFAE3zADm+OFtn7O/LkUVmq5ltsAC6\nud5/HJCHw9+gB8B/BRD1Dw9gdoOx5L51CcrTgbqIzQKBgQDNjQEbLjEH3O2Z3ehA\nb60PSGQSNOEeJeQKeq7vPqFoKeLCbl2QDOvha1zeCIfe7fLC9BrSEhvjRElwDiBc\nhNTemC7ZFc8IYoV1eVi2M8prt050cXoaO7OXFr/wIgMDHHSj+1c+Z1kPv0bnjx6P\nSvG7/ndgG3DH2BEk3dSGOuCrKwKBgQDH2FLi3ljU3SYWgJVhjcqBQh6UUIBS6FK0\n235WfmTDXPc/gwj7584RRqpb+xRrYAWeZfGX/zkOUkafLSGb4+rrLhe4Z1HKmIH8\nCOqQXTagAsGKySLbqeYYuWVkdGzN3EahnTscD6YzeORcUjJhvu19wgu5RrHUIoZ6\nYYhqGHET9QKBgQCq1+Kue7MG7QqTE8zBGdEGXc3HECp3y1iBmTyi3zR6hi3SGrcr\nToIThw/V/9MmaDGY9hkAt0p0l8JOH3+oRkNDi8uMZUMBnhl87VHdhqhc5SuRPuwU\nt8Bp+N+pMCu+vzz3OqVl2bI9k2bUebEVul23OiZwO/5+K8j8EmBc/LzVpwKBgCUk\n4vsB4rblx8+E5L72EL6HoJFmiQNf5QdyiH/hDC93lwj5/PB9PELfxIhGGZx/g2vW\nfNoIeP1dc3zgcY+9BAvkTEpdAcnLINXMfnSIrr9846Y9DjqP0JGl29+Y+CQnHgWp\n6LOlgPmuLZuvN2gNiazHJVCxgBnytNYITMeTdWkFAoGBALn0vJlFwg6wXgkxkApz\nasMuSJ6rYjIn4Ai3TVZYHHkZQ89ze2OjAdu77ISHKgjkXMEExqkpu/mq5EF28M+9\n/1J0rLIZZwdjUZu0atPsXOkG0unUdc9NbQrBJk+ZNMIgUTq0NdgRiV+nTfp9FEeP\nkSC/a8hSpcayJhSlEWzn1Mrl\n-----END PRIVATE KEY-----\n",
    }),
  });
}
export const messaging = admin.messaging();