"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const integrations = [
  {
    name: "LuckPerms",
    description: "Minecraft permissions plugin",
    image: "/integrations/luckperms.svg",
  },
  {
    name: "Skript",
    description: "Minecraft skripting plugin",
    image: "/integrations/skript.svg",
  },
  {
    name: "Stripe",
    description: "Payment processor",
    image: "/integrations/stripe.svg",
  },
];

export function IntegrationsSection() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Integrations</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with the tools and services you already use.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => {
              return (
                <Card
                  key={index}
                  className="bg-card/30 border-border/50 hover:border-border hover:bg-card/60 transition-all duration-300 group cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div
                        className={`rounded-2xl group-hover:scale-110 transition-transform duration-300 relative w-20 h-20 flex items-center justify-center`}
                      >
                        <Image
                          src={integration.image}
                          alt={`${integration.name} logo`}
                          width={96}
                          height={96}
                          className="object-contain"
                        />
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-foreground transition-colors">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
