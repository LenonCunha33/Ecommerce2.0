import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // 📌 Campos adicionais de dados pessoais
    celular: { type: String, default: "" },
    telefone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    cpf: { type: String, default: "" },
    nascimento: { type: String, default: "" },
    sexo: { type: String, enum: ["masculino", "feminino"], default: "masculino" },
    promo: { type: Boolean, default: false },

    cartData: {
      type: Object,
      default: {},
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    minimize: false,
  }
);

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

export default UserModel;
