import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json();
    const { images } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: '이미지가 제공되지 않았습니다.' }, { status: 400 });
    }

    const prompt = `
다음은 고객 관리 시스템(CRM)에서 추출된 명단 혹은 가입 문서의 텍스트 데이터입니다. 문서에 포함된 모든 고객(보통 1명~20명 이상)의 정보를 추출하여 JSON 배열 형식으로 반환해 주세요.

[데이터 추출 핵심 규칙]
1. 데이터 구조: 표 형태로 되어 있으며, 각 행마다 한 명의 고객을 나타냅니다.
2. 이름 (name): 알파벳 대문자(예: AN HUIYAN, CUI LIN 등) 또는 한글로 되어 있습니다. 직업(예: 초,중,고등학생, 전업주부)은 이름이 아닙니다.
3. 나이 및 성별 (age, gender): 주민등록번호(또는 외국인등록번호)를 기반으로 정확히 계산해야 합니다. (예: 130501-8820027)
   - 앞 6자리(YYMMDD)를 통해 출생년도를 파악하여 현재(2026년) 기준 나이를 계산하세요. (예: 130501은 2013년생, 900919는 1990년생)
   - 뒷자리 첫 번째 숫자(성별 코드)를 통해 성별을 판별하세요.
     * 1, 3 (내국인 남성), 5, 7 (외국인 남성) -> '남'
     * 2, 4 (내국인 여성), 6, 8 (외국인 여성) -> '여'
   - [중요] 개인정보 보호를 위해 주민등록번호 원본은 절대 출력하지 마세요. 오직 나이와 성별 계산용으로만 사용하고 즉시 폐기해야 합니다.
4. 주소 (address): 시/도부터 상세 주소(동, 호수)까지 전체를 추출하세요.
5. 휴대폰 번호 (mobile): 010-XXXX-XXXX 형태의 번호를 추출하세요.
6. 이메일 등 기타 불필요한 정보는 무시하세요.

반드시 아래 스키마에 맞는 JSON 데이터만 출력하고 설명은 포함하지 마세요.

{
  "clients": [
    {
      "name": "고객 이름",
      "age": "계산된 나이 (숫자만, 예: 34)",
      "gender": "'남' 또는 '여'",
      "address": "상세 주소 전체",
      "phone": "",
      "mobile": "010-XXXX-XXXX 형식",
      "products": [],
      "contractDate": ""
    }
  ]
}

}
`;

    const messageContent = [
      { type: 'text', text: prompt },
      ...images.map((img: string) => ({ type: 'image_url', image_url: { url: img } }))
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: messageContent as any }],
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
