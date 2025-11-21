import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { resetPassword } from "@/api/auth";

// Define the form schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Slaptažodis turi būti bent 8 simbolių ilgio")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Slaptažodis turi turėti bent vieną didžiąją raidę, mažąją raidę ir skaičių"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Slaptažodžiai turi sutapti",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Watch the password fields to enable/disable submit button
  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const token = searchParams.get("token");

    if (!token) {
      setErrorMessage("Neteisinga arba pasibaigusi nuoroda.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPassword({
        token,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });

      if (response.success) {
        setSuccessMessage(
          "Jūsų slaptažodis sėkmingai atnaujintas! Galite prisijungti su nauju slaptažodžiu."
        );
        reset();
        // Optionally redirect to login after a delay
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setErrorMessage(
          response.message ||
            "Nepavyko atnaujinti slaptažodžio. Bandykite dar kartą."
        );
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMessage(
        "Įvyko klaida atnaujinant slaptažodį. Bandykite dar kartą."
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
          <p className="text-slate-400">Atstatykite savo slaptažodį</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">
              Atkurti slaptažodį
            </CardTitle>
            <CardDescription className="text-slate-400">
              Įveskite naują slaptažodį
            </CardDescription>
          </CardHeader>

          <CardContent>
            {successMessage && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 text-green-300 text-sm rounded-lg">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-200"
                >
                  Naujas slaptažodis
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Įveskite naują slaptažodį"
                    {...register("password")}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-200"
                >
                  Pakartokite slaptažodį
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Pakartokite slaptažodį"
                    {...register("confirmPassword")}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full mt-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Atnaujinama...
                  </span>
                ) : (
                  "Atnaujinti slaptažodį"
                )}
              </Button>

              <div className="text-center mt-4 text-sm text-slate-400">
                <button
                  onClick={() => navigate(-1)}
                  className="text-blue-400 hover:text-blue-300 hover:underline focus:outline-none"
                >
                  &larr; Grįžti atgal
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
