import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPassword } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const forgotPasswordSchema = z
  .object({
    email: z.string().email("Neteisingas el. pašto adresas"),
    confirmEmail: z.string().email("Neteisingas el. pašto adresas"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "El. pašto adresai nesutampa",
    path: ["confirmEmail"],
  });

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordView() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await forgotPassword(data.email);

      if (response.success) {
        setSuccessMessage(
          "Nuoroda slaptažodžiui atstatyti išsiųsta į jūsų el. paštą"
        );
        reset();
      } else {
        setErrorMessage(
          response.message || "Nepavyko išsiųsti nuorodos. Bandykite dar kartą."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMessage(
        "Įvyko klaida siunčiant atstatymo nuorodą. Bandykite dar kartą."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">VML Auto</h1>
          <p className="text-slate-400">Atstatyti slaptažodį</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">
              Pamiršote slaptažodį?
            </CardTitle>
            <CardDescription className="text-slate-400">
              Įveskite savo el. pašto adresą, ir mes išsiųsime jums nuorodą
              slaptažodžiui atstatyti
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-400 text-sm">{successMessage}</p>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-200"
                >
                  El. Paštas
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="pavizdys@gmail.com"
                    {...register("email")}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Confirm Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmEmail"
                  className="text-sm font-medium text-slate-200"
                >
                  Patvirtinti el. paštą
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="confirmEmail"
                    type="email"
                    placeholder="pavizdys@gmail.com"
                    {...register("confirmEmail")}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
                  />
                </div>
                {errors.confirmEmail && (
                  <p className="text-red-400 text-sm">
                    {errors.confirmEmail.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Siunčiama..." : "Siųsti nuorodą"}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Grįžti į prisijungimą
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            2025 VML Auto. Visos teisės saugomos.
          </p>
        </div>
      </div>
    </div>
  );
}
