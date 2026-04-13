import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "done" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) setStatus("valid");
        else if (data.reason === "already_unsubscribed") setStatus("done");
        else setStatus("invalid");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("done");
      else if (data?.reason === "already_unsubscribed") setStatus("done");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="font-playfair text-2xl text-[#D4AF37] mb-6">The Art of ISM</h1>
        {status === "loading" && <p className="text-[#F5E7C6]/60">Loading...</p>}
        {status === "invalid" && <p className="text-[#F5E7C6]/60">This unsubscribe link is invalid or has expired.</p>}
        {status === "error" && <p className="text-red-400">Something went wrong. Please try again later.</p>}
        {status === "valid" && (
          <>
            <p className="text-[#F5E7C6]/80 mb-6">
              Would you like to unsubscribe from future emails?
            </p>
            <button
              onClick={handleUnsubscribe}
              className="bg-[#7A000C] text-[#F5E7C6] px-8 py-3 rounded font-inter text-sm font-semibold hover:bg-[#7A000C]/80 transition-colors"
            >
              Confirm Unsubscribe
            </button>
          </>
        )}
        {status === "done" && (
          <p className="text-[#F5E7C6]/80">
            You have been successfully unsubscribed. You will no longer receive emails from us.
          </p>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
