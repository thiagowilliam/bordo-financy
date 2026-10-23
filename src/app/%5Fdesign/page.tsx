import { notFound } from "next/navigation";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const surfaceColors = [
  ["background", "bg-background"],
  ["card", "bg-card"],
  ["secondary / muted", "bg-muted"],
  ["border", "bg-border"],
  ["foreground", "bg-foreground"],
  ["muted-foreground", "bg-muted-foreground"],
  ["subtle-foreground", "bg-subtle-foreground"],
] as const;

const brandColors = [
  ["primary", "bg-primary"],
  ["primary-soft", "bg-primary-soft"],
  ["primary-strong", "bg-primary-strong"],
  ["cta", "bg-cta"],
  ["cta-soft", "bg-cta-soft"],
] as const;

const statusColors = [
  ["success", "bg-success"],
  ["success-soft", "bg-success-soft"],
  ["success-ink", "bg-success-ink"],
  ["warning", "bg-warning"],
  ["warning-soft", "bg-warning-soft"],
  ["warning-ink", "bg-warning-ink"],
  ["destructive", "bg-destructive"],
  ["destructive-soft", "bg-destructive-soft"],
  ["destructive-ink", "bg-destructive-ink"],
] as const;

const chartColors = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
] as const;

const radii = [
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-4xl",
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Swatches({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(([name, bg]) => (
        <div key={name} className="flex flex-col gap-1.5">
          <div className={`${bg} h-14 rounded-lg border`} />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}

export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tight">Bordo · Design system</h1>
        <p className="text-muted-foreground">Página apenas de desenvolvimento.</p>
      </header>

      <Section title="Cores">
        <Swatches items={surfaceColors} />
        <Swatches items={brandColors} />
        <Swatches items={statusColors} />
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {chartColors.map((bg, i) => (
            <div key={bg} className="flex flex-col gap-1.5">
              <div className={`${bg} h-14 rounded-lg`} />
              <span className="text-xs text-muted-foreground">chart-{i + 1}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografia">
        <div className="flex flex-col gap-3">
          <p className="text-6xl font-bold tracking-tighter financial-value">€ 3.621,30</p>
          <p className="text-4xl font-bold tracking-tight">Lisboa &amp; Sintra</p>
          <p className="text-2xl font-bold tracking-tight">Custos de base</p>
          <p className="text-lg font-semibold">Hospedagem em Alfama</p>
          <p className="text-sm">Texto base de 14px para listas e formulários.</p>
          <p className="text-xs text-muted-foreground">Texto secundário de 12px.</p>
          <p className="text-sm financial-value">tabular-nums: 1.111,11 · 8.888,88 · 0.000,00</p>
        </div>
      </Section>

      <Section title="Raios">
        <div className="flex flex-wrap gap-4">
          {radii.map((r) => (
            <div key={r} className="flex flex-col items-center gap-1.5">
              <div className={`${r} size-16 border border-primary bg-primary-soft`} />
              <span className="text-xs text-muted-foreground">{r.replace("rounded-", "")}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Botões e badges">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="cta" size="lg">
            Lançar gasto
          </Button>
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="destructive">Excluir</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Padrão</Badge>
          <Badge variant="secondary">Secundário</Badge>
          <Badge variant="outline">Contorno</Badge>
          <Badge className="bg-success-soft text-success-ink">Dentro do orçamento</Badge>
          <Badge className="bg-warning-soft text-warning-ink">Acima de 80%</Badge>
          <Badge className="bg-destructive-soft text-destructive-ink">Estourou</Badge>
        </div>
      </Section>

      <Section title="Formulários">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar gastos" />
          </div>
          <Input placeholder="Descrição" aria-invalid />
          <Textarea className="sm:col-span-2" placeholder="Observações" />
        </div>
      </Section>

      <Section title="Superfícies">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lisboa &amp; Sintra</CardTitle>
              <CardDescription>12 a 19 de maio</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-2xl font-bold financial-value">€ 2.604,90</p>
              <Skeleton className="h-2 w-full" />
              <Separator />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Tabs defaultValue="dia">
                <TabsList>
                  <TabsTrigger value="visao">Visão geral</TabsTrigger>
                  <TabsTrigger value="base">Custos de base</TabsTrigger>
                  <TabsTrigger value="dia">Dia a dia</TabsTrigger>
                </TabsList>
                <TabsContent value="dia" className="pt-4 text-sm">
                  Conteúdo da aba.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <Calendar mode="single" className="rounded-xl border" />
      </Section>
    </main>
  );
}
