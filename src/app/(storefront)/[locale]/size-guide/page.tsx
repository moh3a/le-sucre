import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Ruler } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Guide des tailles",
};

const clothingSizes = {
  headers: ["XS", "S", "M", "L", "XL", "XXL"],
  rows: [
    { label: "Poitrine (cm)", values: ["82-86", "86-90", "90-95", "95-100", "100-106", "106-112"] },
    { label: "Taille (cm)", values: ["62-66", "66-70", "70-75", "75-80", "80-86", "86-92"] },
    { label: "Hanches (cm)", values: ["88-92", "92-96", "96-100", "100-105", "105-110", "110-116"] },
    { label: "Longueur (cm)", values: ["60", "62", "64", "66", "68", "70"] },
  ],
};

const shoeSizes = {
  headers: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
  rows: [
    { label: "Pied (cm)", values: ["22.5", "23", "23.8", "24.5", "25.2", "25.8", "26.5", "27.2", "27.8", "28.5"] },
    { label: "Pointure EU", values: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] },
    { label: "Pointure UK", values: ["3.5", "4", "5", "5.5", "6.5", "7.5", "8", "9", "9.5", "10.5"] },
  ],
};

const accessorySizes = {
  headers: ["Taille", "Tour de tête (cm)", "Diamètre (cm)"],
  rows: [
    { label: "Casquettes", values: ["S/M : 54-57", "L/XL : 57-60", "-"] },
    { label: "Ceintures", values: ["75-85", "85-95", "95-105"] },
    { label: "Montres", values: ["Bracelet 16cm", "Bracelet 18cm", "Bracelet 20cm"] },
  ],
};

export default async function SizeGuidePage({ params }: Props) {
  const {} = await params;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Guide des tailles</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Retrouvez toutes les informations nécessaires pour choisir la taille parfaite.
        </p>
      </section>

      <Separator />

      {/* CATEGORY TABS */}
      <section>
        <Tabs defaultValue="vetements" className="w-full">
          <TabsList className="mb-8 w-full justify-start">
            <TabsTrigger value="vetements">Vêtements</TabsTrigger>
            <TabsTrigger value="chaussures">Chaussures</TabsTrigger>
            <TabsTrigger value="accessoires">Accessoires</TabsTrigger>
          </TabsList>

          <TabsContent value="vetements">
            <Card>
              <CardHeader>
                <CardTitle>Vêtements - Guide des tailles</CardTitle>
                <CardDescription>
                  Mesures en centimètres. Pour choisir votre taille, prenez vos mesures et
                  référez-vous au tableau ci-dessous.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground p-3 text-left font-medium">Mesure</th>
                        {clothingSizes.headers.map((h) => (
                          <th key={h} className="text-muted-foreground p-3 text-center font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clothingSizes.rows.map((row) => (
                        <tr key={row.label} className="border-b last:border-0">
                          <td className="p-3 font-medium">{row.label}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="p-3 text-center">
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chaussures">
            <Card>
              <CardHeader>
                <CardTitle>Chaussures - Guide des tailles</CardTitle>
                <CardDescription>
                  Mesurez la longueur de votre pied et reportez-vous au tableau pour trouver votre
                  pointure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground p-3 text-left font-medium">Mesure</th>
                        {shoeSizes.headers.map((h) => (
                          <th key={h} className="text-muted-foreground p-3 text-center font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shoeSizes.rows.map((row) => (
                        <tr key={row.label} className="border-b last:border-0">
                          <td className="p-3 font-medium">{row.label}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="p-3 text-center">
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessoires">
            <Card>
              <CardHeader>
                <CardTitle>Accessoires - Guide des tailles</CardTitle>
                <CardDescription>
                Référez-vous aux mesures ci-dessous pour choisir la taille de vos accessoires.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-muted-foreground p-3 text-left font-medium">Type</th>
                        {accessorySizes.headers.slice(1).map((h) => (
                          <th key={h} className="text-muted-foreground p-3 text-left font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {accessorySizes.rows.map((row) => (
                        <tr key={row.label} className="border-b last:border-0">
                          <td className="p-3 font-medium">{row.label}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="p-3">
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* MEASUREMENT TIPS */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Comment prendre vos mesures</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Poitrine",
              description:
                "Mesurez le tour de poitrine à l'endroit le plus fort, en passant le mètre sous les bras.",
            },
            {
              title: "Taille",
              description:
                "Mesurez le tour de taille à l'endroit le plus fin, généralement au-dessus du nombril.",
            },
            {
              title: "Hanches",
              description:
                "Mesurez le tour de hanches à l'endroit le plus large, en gardant les pieds joints.",
            },
          ].map((tip) => (
            <Card key={tip.title}>
              <CardHeader>
                <div className="bg-muted mb-2 flex h-24 items-center justify-center rounded-lg">
                  <Ruler className="text-muted-foreground size-8" />
                </div>
                <CardTitle className="text-base">{tip.title}</CardTitle>
                <CardDescription>{tip.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        {/* TODO: Add measurement illustrations */}
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Des illustrations détaillées seront bientôt disponibles pour vous guider.
        </p>
      </section>
    </div>
  );
}
