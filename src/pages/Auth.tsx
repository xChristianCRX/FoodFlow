import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../libs/axios";
import { motion } from "framer-motion";
import Input from "../components/Input";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useContextSelector } from "use-context-selector";
import { AuthContext } from "../contexts/AuthContext";

const loginSchema = z.object({
  username: z.string().min(3, "O usuário deve conter no mínimo 3 caracteres"),
  password: z.string().min(8, "A senha deve conter no mínimo 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve conter no mínimo 3 caracteres"),
  username: z.string().min(3, "O usuário deve conter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve conter no mínimo 8 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const login = useContextSelector(AuthContext, (context) => context.login);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    formState: { errors: errorsRegister },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const handleLogin = async (data: LoginForm) => {
    try {
      await login(data.username, data.password);
      toast.success("Seja bem-vindo!");
      navigate("/tables");
    } catch (error: unknown) {
      const err = error as AxiosError;

      if (err.response?.status === 401) {
        toast.error("Usuário ou senha inválidos.");
      } else {
        toast.error("Erro no login. Tente novamente.");
      }
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    try {
      const response = await api.post("/person", data);
      console.log(response);
      toast.success("Registro bem-sucedido!");
      setIsRegistering(false);
    } catch (error: unknown) {
      const err = error as AxiosError;
      if (err.response?.status === 409) {
        toast.error("Usuário ou e-mail já existente!");
      } else {
        toast.error("Erro no registro. Tente novamente.");
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-[#fef7f0] flex items-center justify-center">
      <div className="relative w-[1000px] h-[550px] bg-white shadow-2xl rounded-3xl overflow-hidden flex">
        {/* Animation wrapper */}
        <motion.div
          animate={{ x: isRegistering ? "-50%" : "0%" }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="flex w-[200%] h-full"
        >
          {/* Login */}
          <div className="w-1/2 flex flex-col justify-center items-center p-10 gap-5">
            <h2 className="text-4xl font-extrabold text-[#3E2C1C]">
              Bem-vindo de volta!
            </h2>
            <form
              onSubmit={handleSubmitLogin(handleLogin)}
              className="flex flex-col gap-4 w-80"
            >
              <Input
                label="Usuário"
                {...registerLogin("username")}
              />
              {errorsLogin.username && (
                <span className="text-red-500 text-sm">
                  {errorsLogin.username.message}
                </span>
              )}
              <Input
                label="Senha"
                type="password"
                {...registerLogin("password")}
              />
              {errorsLogin.password && (
                <span className="text-red-500 text-sm">
                  {errorsLogin.password.message}
                </span>
              )}
              <button
                type="submit"
                className="bg-[#D35400] text-white py-2 rounded-lg hover:bg-[#a63e00] transition"
              >
                Entrar
              </button>
            </form>
          </div>

          {/* Register */}
          <div className="w-1/2 flex flex-col justify-center items-center p-10 gap-5">
            <h2 className="text-4xl font-extrabold text-[#3E2C1C]">
              Crie sua conta
            </h2>
            <form
              onSubmit={handleSubmitRegister(handleRegister)}
              className="flex flex-col gap-4 w-80"
            >
              <Input
                label="Nome"
                {...registerRegister("name")}
              />
              {errorsRegister.name && (
                <span className="text-red-500 text-sm">
                  {errorsRegister.name.message}
                </span>
              )}
              <Input
                label="Usuário"
                {...registerRegister("username")}
              />
              {errorsRegister.username && (
                <span className="text-red-500 text-sm">
                  {errorsRegister.username.message}
                </span>
              )}
              <Input
                label="E-mail"
                {...registerRegister("email")}
              />
              {errorsRegister.email && (
                <span className="text-red-500 text-sm">
                  {errorsRegister.email.message}
                </span>
              )}
              <Input
                label="Senha"
                type="password"
                {...registerRegister("password")}
              />
              {errorsRegister.password && (
                <span className="text-red-500 text-sm">
                  {errorsRegister.password.message}
                </span>
              )}
              <button
                type="submit"
                className="bg-[#FF7F50] text-white py-2 rounded-lg hover:bg-[#e56c3c] transition"
              >
                Registrar
              </button>
            </form>
          </div>
        </motion.div>

        {/* Right panel */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[#FF7F50] text-white flex flex-col items-center justify-center gap-6">
          <h2 className="text-4xl font-extrabold">
            {isRegistering ? "Já tem uma conta?" : "Novo por aqui?"}
          </h2>
          <p className="text-center px-10 text-lg">
            {isRegistering
              ? "Faça login e gerencie seus pedidos facilmente."
              : "Cadastre-se e comece a usar o sistema do restaurante."}
          </p>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="border-2 border-white px-6 py-2 rounded-full hover:bg-white hover:text-[#D35400] transition"
          >
            {isRegistering ? "Entrar" : "Registrar-se"}
          </button>
        </div>
      </div>
    </div>
  );
};