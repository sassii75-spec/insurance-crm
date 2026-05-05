"use client";

import { useState } from "react";
import styles from "./Login.module.css";
import { useAuth, User } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userRef = doc(db, "users", id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        
        if (userData.password !== password) {
          setError("비밀번호가 일치하지 않습니다.");
          setIsLoading(false);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (!userData.isActive) {
          setError("사용이 중지된 계정입니다. 관리자에게 문의하세요.");
          setIsLoading(false);
          return;
        }

        if (userData.validUntil < today) {
          setError("사용 기간이 만료되었습니다. 관리자에게 문의하세요.");
          setIsLoading(false);
          return;
        }

        // Login success
        login(userData);
        router.push("/sales/dashboard");
      } else {
        setError("존재하지 않는 아이디입니다.");
      }
    } catch (err) {
      console.error(err);
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <h1>InsurePro</h1>
          <p>모바일 영업 지도 및 고객 관리</p>
        </div>
        
        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <input 
              type="text" 
              placeholder="아이디" 
              className={styles.inputField}
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="비밀번호" 
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
