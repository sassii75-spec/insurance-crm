/**
 * 비밀번호 단방향 암호화 (SHA-256)
 * @param password 사용자가 입력한 평문 비밀번호
 * @param salt 고유값 (주로 사용자 ID를 사용)
 * @returns 해싱된 16진수 문자열
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  // 비밀번호와 salt(사용자 ID)를 결합하여 레인보우 테이블 공격 방어
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
