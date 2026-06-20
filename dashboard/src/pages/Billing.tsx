import { useEffect, useState } from "react";
import { CreditCard, Check, Zap } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  limits: { downloads: number; storage: number; members: number };
  current: boolean;
}

const PLANS: Plan[] = [
  { id: "free", name: "Free", price: 0, limits: { downloads: 50, storage: 5, members: 1 }, current: true },
  { id: "pro", name: "Pro", price: 9, limits: { downloads: 500, storage: 50, members: 5 }, current: false },
  { id: "team", name: "Team", price: 29, limits: { downloads: 5000, storage: 500, members: 20 }, current: false },
  { id: "enterprise", name: "Enterprise", price: 99, limits: { downloads: -1, storage: -1, members: -1 }, current: false },
];

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/billing/plan", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => { if (data.plan) setCurrentPlan(data.plan); })
      .catch(() => {});
  }, []);

  const selectPlan = async (planId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to change plan");
      }
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setCurrentPlan(planId);
      }
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Billing & Plans</h1>
      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-gray-900 rounded-xl p-5 border-2 ${isCurrent ? "border-brand" : "border-gray-800"} relative`}
            >
              {isCurrent && (
                <div className="absolute -top-2 right-3 bg-brand text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  Current
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                {plan.id === "free" ? <CreditCard className="w-5 h-5 text-gray-400" /> : <Zap className="w-5 h-5 text-brand-light" />}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${plan.price}<span className="text-sm text-gray-500 font-normal">/mo</span>
              </div>
              <ul className="space-y-2 mt-4 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />
                  {plan.limits.downloads === -1 ? "Unlimited" : plan.limits.downloads} downloads/mo
                </li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />
                  {plan.limits.storage === -1 ? "Unlimited" : `${plan.limits.storage} GB`} storage
                </li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" />
                  {plan.limits.members === -1 ? "Unlimited" : plan.limits.members} team members
                </li>
              </ul>
              <button
                onClick={() => selectPlan(plan.id)}
                disabled={isCurrent || loading}
                className={`w-full mt-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isCurrent
                    ? "bg-gray-800 text-gray-500 cursor-default"
                    : "bg-brand hover:bg-brand-dark text-white disabled:opacity-50"
                }`}
              >
                {isCurrent ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
