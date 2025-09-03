import admin from "firebase-admin";


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "swing-social-28101",
      clientEmail: "firebase-adminsdk-fbsvc@swing-social-28101.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCaOBg9A4NOfooi\nKkC2rJPYezAgqFGnygpT7XNAZlLBbBwlrJLUi2VUxp4ef6vIG0jTYq7tKxqxdKk5\n+bVMjlqaNVDZWNaB6aM2IQCZnYsAEM+MTrTPVZXBNKvv7Ryf5nlJJZbIQj0BaENG\nNLzK4HRv1zAOHMdCUco1A+Uq58faZY5ovMol/ZCdW7/wjCx6P1jT6gv2UFt/njac\nvzVqCFDlv+PuHNFc9ooNrhRi+lIj6JQNhGuP5kNGGpYPguMJYiqvq4WXP5wS/0n9\nU2ol7uyfiVRkKjuKGP6ayMElpfFf5emgO8PQobDtixMdfKSgrj/9hVeYwzEniffR\nfNh7z1thAgMBAAECggEAAfameFn/GS5YDxWyogcrqra6AIoKebRpntmH47ec/h4+\nQLLw+6It6OWbRcNVkJEOw4I4iYeu9oUIH1c9wHr5GrvrCsySwcl6IBcZ4HRp1j2T\nwH/2bvbyY49XUREXxQFny4KeNNaDDrpUTb4fv58aXGiRxNw6iggFWj9xpeYyXGZB\niQooPtVwm/Ew2iLdmFUI+EM48yw5IN/MK9knDyJSoYbOml36OQBE2EOP7pipTH+g\niSrAc5svvBZd0u7MslO257k6ncsClq/d5q9lw4LGoJ8Y8R1i5XTY/Fq9VS0RFrsQ\nY61nkJjBPoyL/RmtZPG0af7Se24vgU4CHmpvZ+4dAQKBgQDW+oPyYBbJ6C/DI+th\nmzppjQ3cWbtR9fHCHdMnp8mgVtviUVgvJHz7chBBiE2zq8fh+BELiQv4xd3yOhrx\nYH5vMmfPuabxU0gNgYh/8BCylIdcL1naoa//OC9dz2E9IPTBF3usmXq4tVBMKJLZ\nVlhnKBuod/PUHlVvh4NCz5I0KQKBgQC3pYqsRUL9Q3gT1Q9TVvjA+vVXIUEAnEn0\nuijExf5VDZckWdQpSKVqm/uGGo25mnOVnSfFp3w99eWoGTQF7nhXB2jKiaVQJkuM\n8XQigcptCQF9axRdFx+YqlqG89hCLPpDrIaktu5xcCHx5S856yIh0rOphzOWIsIW\nBsxaxsWUeQKBgEdNlgAJIOXdDiJyQnsASnKB52wDkx7PLV2OGOAZRcXZqVq6Uj5o\nos+feIbT17nVKxnm9nhV/1OHBWN3JEKVF7p4BHiggh+e2NIp+YU9sbwZiX/o8KuU\nX1SOZR9/TihBSwzUZh/MVCj5cmWgO3y8p9unMO1Cw+vCF+JDFyVMxZhpAoGBAJT3\ngnJVSI66MOgddu4KaYPYzjScM+cz38XVUAa1+KWzfXuuJixK0muVFcVlOrtorwOY\n1E8/mceE9IKT1yBMnW8zAmzwlJlcRwKQRb1L/RDPMlczCfStMiMbZI19tVmQtH06\nsIliHi8EX3ShjNp1gl1fVf9ZPZ42matWXmPwQws5AoGAZQD1MpCILfhTfo24vsOm\n96NGqqD6o6+w5ViQcdlt6tbkAxUA+3S+P7xGf2QwAbY2+A5+k822Q/ymc4zw/1e/\nYNP52yfjGtDZs7EIZB8ZM9ei4YUDayhCdMfOiAaXpgzNPZEAxQktFu6OpOmP9qnp\n4FsEdOuITeSjGqn6fKuqs/w=\n-----END PRIVATE KEY-----\n",
    }),
  });
}
export const messaging = admin.messaging();