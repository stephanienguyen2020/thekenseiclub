import { Check } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "$9",
    features: ["1 Bot", "100 Users", "Basic Commands", "Email Support"],
  },
  {
    name: "Pro",
    price: "$29",
    features: ["5 Bots", "Unlimited Users", "Advanced Commands", "Priority Support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited Bots", "Unlimited Users", "Custom Features", "Dedicated Support"],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <p className="text-4xl font-bold mb-6">
                {plan.price}
                <span className="text-lg font-normal">/mo</span>
              </p>
              <ul className="mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center mb-2">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-4 rounded transition duration-300">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

