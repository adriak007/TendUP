import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { parseCartaoPontoText } from "@/lib/cartaoPonto/parser";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    text = result.text;
  } catch (err) {
    console.error("Erro ao ler PDF:", err);
    return NextResponse.json({ error: "Não foi possível ler o PDF enviado" }, { status: 400 });
  } finally {
    await parser.destroy();
  }

  const parsed = parseCartaoPontoText(text);

  if (parsed.dias.length === 0) {
    return NextResponse.json(
      { error: "Não foi possível reconhecer o formato deste cartão ponto" },
      { status: 422 },
    );
  }

  return NextResponse.json(parsed);
}
