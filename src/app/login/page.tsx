"use client";

import { useState } from "react";
import styles from "./Login.module.css";
import { useAuth, User } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // For Forced Password Change
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

        if (userData.requirePasswordChange) {
          setChangingPasswordUser(userData);
          setError("");
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("비밀번호를 모두 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 4) {
      setError("비밀번호는 최소 4자리 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, "users", changingPasswordUser!.id);
      await updateDoc(userRef, {
        password: newPassword,
        requirePasswordChange: false
      });
      
      const updatedUser = { ...changingPasswordUser!, password: newPassword, requirePasswordChange: false };
      login(updatedUser);
      router.push("/sales/dashboard");
    } catch (err) {
      console.error(err);
      setError("비밀번호 변경 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  if (changingPasswordUser) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.logo}>
            <h1>비밀번호 변경</h1>
            <p>보안을 위해 새 비밀번호를 설정해주세요.</p>
          </div>
          
          {error && <div className={styles.errorMsg}>{error}</div>}

          <form onSubmit={handlePasswordChange}>
            <div className={styles.formGroup}>
              <input 
                type="password" 
                placeholder="새 비밀번호" 
                className={styles.inputField}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="새 비밀번호 확인" 
                className={styles.inputField}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? "변경 중..." : "변경 완료 및 로그인"}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
