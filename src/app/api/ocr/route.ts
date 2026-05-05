import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: '텍스트가 제공되지 않았습니다.' }, { status: 400 });
    }

    const prompt = `
다음은 보험 청약서 또는 고객 정보가 담긴 문서의 스캔 텍스트입니다. 이 텍스트에서 다음 정보를 정확하게 추출하여 JSON 형식으로만 반환해 주세요.
반드시 아래 스키마에 맞는 JSON 텍스트만 출력해야 하며, 설명이나 다른 텍스트는 포함하지 마세요.

{
  "name": "고객 이름 (없으면 빈 문자열)",
  "age": "나이 숫자 (없으면 빈 문자열)",
  "gender": "'남' 또는 '여' (없으면 '남')",
  "address": "도로명 주소 등 상세 주소 전체 (없으면 빈 문자열)",
  "phone": "유선 전화번호 (없으면 빈 문자열)",
  "mobile": "핸드폰 번호 (없으면 빈 문자열)",
  "products": ["가입상품명1", "가입상품명2"] (없으면 빈 배열),
  "contractDate": "계약일자 (YYYY-MM-DD 형식, 없으면 빈 문자열)"
}

--- 문서 텍스트 ---
${text}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content returned");

    const parsedData = JSON.parse(content);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('OCR API Error:', error);
    return NextResponse.json({ error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
