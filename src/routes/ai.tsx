import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAccounts, useBarter, useInventory, useWarehouse, useBrandDeals, invoiceOutstanding, itemStock, dealValue } from "@/lib/stores";
import { Bot, Send, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { aiChat } from "@/lib/ai.functions";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Atlas" },
      { name: "description", content: "Ask Atlas AI anything about your OOH business." },
    ],
  }),
  component: AiPage,
});

const PROMPTS = [
  "Cheapest hoardings in Guwahati?",
  "Which cities do we cover and at what rates?",
  "What's in the warehouse worth most?",
  "Summarize overdue invoices",
];

function AiPage() {
  const sites = useInventory((s) => s.sites);
  const deals = useBarter((s) => s.deals);
  const invoices = useAccounts((s) => s.invoices);
  const chat = useServerFn(aiChat);

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const warehouse = useWarehouse((s) => s.items);
  const brandDeals = useBrandDeals((s) => s.deals);

  const context = useMemo(() => {
    const overdue = invoices.filter((i) => i.status === "Overdue");

    // Geo rollup: per-city inventory intelligence (keeps context compact at any scale)
    const byCity = new Map<string, typeof sites>();
    for (const s of sites) {
      const arr = byCity.get(s.city) || [];
      arr.push(s);
      byCity.set(s.city, arr);
    }
    const cityLines = [...byCity.entries()].map(([city, arr]) => {
      const free = arr.filter((s) => s.status === "free");
      const rents = arr.map((s) => s.monthlyRent).filter(Boolean).sort((a, b) => a - b);
      const formats = [...new Set(arr.map((s) => s.format))].join("/");
      const cheapest = [...arr].filter((s) => s.monthlyRent > 0).sort((a, b) => a.monthlyRent - b.monthlyRent).slice(0, 2)
        .map((s) => `${s.name} ₹${s.monthlyRent.toLocaleString("en-IN")}`).join(", ");
      const premium = [...arr].sort((a, b) => b.monthlyRent - a.monthlyRent)[0];
      const tags = [...new Set(arr.flatMap((s) => s.aiTags || []))].slice(0, 6).join(",");
      return `${city}: ${arr.length} sites (${free.length} free) [${formats}] rent ₹${rents[0]?.toLocaleString("en-IN") ?? 0}–₹${rents[rents.length - 1]?.toLocaleString("en-IN") ?? 0}/mo | cheapest: ${cheapest || "n/a"} | premium: ${premium ? `${premium.name} ₹${premium.monthlyRent.toLocaleString("en-IN")}` : "n/a"}${tags ? ` | photo-tags: ${tags}` : ""}`;
    });

    const whLines = warehouse.map((i) => {
      const stock = itemStock(i);
      return `${i.sku} ${i.name} (${i.category}): ${stock} units @ ₹${i.unitValue.toLocaleString("en-IN")} = ₹${(stock * i.unitValue).toLocaleString("en-IN")}`;
    });

    const pipeline = brandDeals.filter((d) => !["lost"].includes(d.stage));

    return [
      `INVENTORY (${sites.length} sites across ${byCity.size} cities — per city):`,
      ...cityLines,
      `\nWAREHOUSE (barter goods, ${warehouse.length} SKUs):`,
      whLines.length ? whLines.join("\n") : "empty",
      `\nBRAND PIPELINE: ${pipeline.length} active deals, ${brandDeals.filter((d) => d.stage === "live").length} live`,
      `Active barter deals: ${deals.filter((d) => d.status === "active").length}`,
      `Overdue invoices: ${overdue.length}, total ₹${overdue.reduce((a, i) => a + invoiceOutstanding(i), 0).toLocaleString("en-IN")}`,
      `Total outstanding sales: ₹${invoices.filter((i) => i.type === "sales").reduce((a, i) => a + invoiceOutstanding(i), 0).toLocaleString("en-IN")}`,
    ].join("\n");
  }, [sites, deals, invoices, warehouse, brandDeals]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setBusy(true);
    try {
      const res = await chat({
        data: { message: msg, context, history: messages.slice(-8) },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't reach the AI service." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-3.5rem-4rem)] max-w-3xl flex-col p-4 md:h-[calc(100vh-3.5rem)] md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Atlas AI</h1>
            <p className="text-xs text-muted-foreground">
              Grounded on your live inventory, barters &amp; invoices
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-card">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center">
              <div className="text-center">
                <Bot className="mx-auto mb-3 h-10 w-10 text-primary" />
                <p className="text-sm text-muted-foreground">Ask me anything to get started.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={"flex gap-2 " + (m.role === "user" ? "justify-end" : "")}>
                  {m.role === "assistant" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm " +
                      (m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground")
                    }
                  >
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold">
                      Y
                    </div>
                  )}
                </div>
              ))}
              {busy && <div className="text-xs text-muted-foreground">Atlas is thinking…</div>}
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask about sites, barters, invoices…"
            className="h-11 flex-1 rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/40"
          />
          <button
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            className="grid h-11 w-11 place-items-center rounded-2xl gradient-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
