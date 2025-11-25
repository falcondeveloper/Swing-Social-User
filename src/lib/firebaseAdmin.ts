import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "swing-social-website",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCsqXUrbsVftohg\nVB+gmBkTOkR9yPTeAvT/1VHx9PAFCjwTK4XpQoHvtfvemUDIPKcYSVHOF+1sg8OI\n+oEkQOKCR6IR59iA7kfXN1WG+TFZyLKHpAVh5QMPJjVu+26gsOftaF5fAQNRZ+Md\nd0xuKysLkKSuWLkpXZgOL3Os++jAE7d7yp+PboZrTacl0y/I265PqigHSt6/J7ws\niCfXZio/byBg62tNBNAgGsFQrVDIq4gaM1My8tgilZdR4HVdbcvJnwSvW8TVyzEj\nmX3AGLCHOY3d/5yKIYTqT1w5NxfRGrZbaFRV7j3QgRrVjcHOeY4eOPTucYqjp4fI\n1GXNIC6PAgMBAAECggEAF1J1wt3Ih/WA6voR95WeiswBD7iC6DDKunqBrMa4BluW\njRmrkebA5F8sMVTOvP1XA18hT07zbAf0STQFGPTcDlryAlcoaxSZ3EaGJUrS/Adc\nThln/LbRY0zMROcYz1h19h8gjYFL2xrG67up4EEGeckaOs6TMYo0jXNNaF1H2Bct\n+YAVm9RDoT9QTeog9n3A65fMGqeYhrA8ZFBAWZrncGRdBp+aOMnRSC1m/vrNuINH\nAukeISmecfKiYMPMCixKQYkCgsEuNSnPfFiaMcMaqQKag8tMCeu1o/d4Wqex1gOx\njw2gV8ywLinUxC2oZwxqIvil+5ZRIFrjP3zerQyiQQKBgQDnh7BR9byiuQ/LL67X\nvOIylmMPX3jNOpaMq3isynGkGnHWlct6t8amfIWpbr2BXT3KgE5qd99/68tjt/a4\nxrcQoKdqrNt3z0xoMHgJ7/5tgAEcoHpLH6Qej4bvkV6Iv3ILDL8FRXONWmRIUTyg\nW5G0l5qauNaeojxCHyOq1xm8rwKBgQC+6QZsS6V4TjP7XthKauxwR/ZVoeuPX9tK\n9hOnm/Oxl2h1mKwHDSO6jUkPdztRC16jsalr9O4qi1Y8pCyX30f4BShqWTpz/4Z3\n4DScKd4x0+khp0/IxwI/LcgnpsZHDMt4kk6ZFaK0PBnTkTs906n/FJQCp8S30P0y\n6Zt/xC3kIQKBgCOkft9PLjf6t1S3RXpOyJ+zCRLvxqAJee2z5ALts2ro60d2jfmZ\nWwp8NvNrad8FZKLM98VqKMz/lrMGOgQeC0aTBNLmQ28BSajsdT5KZOekggdPKSRx\nfYl63PH6dgwlNMBAuRNtqqlDFhcP8n5ZOmgLwrA47klDfnVLZ+k/7eVfAoGAZQAD\nVefvcuZsueBDrZtD22M2/7baWM/txIrLezEWjC3+JbjPyis5a8izjmsWBpptR00G\nxQafugJdbVet/+swuBaCe0EZm6TkDyeerb+4vcPO4u8RVrdyiNo/ujqRS6WJQBCn\nZHX9zjy9rSB4pw0EMt9ALudzO4xlaDoO+llfrgECgYEAvzEAW7a+yL2C+xRDA/xi\nCNWniU+TE1/pj2qLXHUiXpue/vAtfYNp0M98U/j0NxIFZ5P/i7q/cqILEAKZSHAB\n3orygM46bmYG6JIgjJd8CIMduh9AMkkEI+PK9+lKrImsnv0aMILJaZttmbJYFy8j\nGG4p9ssNH0dlnGC7QfN2gVo=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, "\n"),
            clientEmail: "firebase-adminsdk-fbsvc@swing-social-website.iam.gserviceaccount.com",
        }),
    });
}

export default admin;