"use client";

import { useEffect, useState } from "react";
import styles from "./AdminUsers.module.css";
import { useAuth, User } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", password: "", validUntil: "2099-12-31" });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push("/sales/dashboard");
      return;
    }

    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const loadedUsers: User[] = [];
    querySnapshot.forEach((doc) => {
      loadedUsers.push(doc.data() as User);
    });
    setUsers(loadedUsers);
  };

  const handleToggleActive = async (targetUser: User) => {
    if (targetUser.id === 'admin' && targetUser.isActive) {
      alert("최고 관리자 계정은 비활성화 할 수 없습니다.");
      return;
    }
    const newStatus = !targetUser.isActive;
    await updateDoc(doc(db, "users", targetUser.id), { isActive: newStatus });
    setUsers(users.map(u => u.id === targetUser.id ? { ...u, isActive: newStatus } : u));
  };

  const handleDateChange = async (id: string, date: string) => {
    await updateDoc(doc(db, "users", id), { validUntil: date });
    setUsers(users.map(u => u.id === id ? { ...u, validUntil: date } : u));
  };

  const handleResetPassword = async (id: string) => {
    if (confirm("비밀번호를 '0000'으로 초기화하시겠습니까?")) {
      await updateDoc(doc(db, "users", id), { password: "0000" });
      alert("비밀번호가 0000으로 초기화되었습니다.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === 'admin') {
      alert("최고 관리자 계정은 삭제할 수 없습니다.");
      return;
    }
    if (confirm("이 사용자 계정을 영구 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "users", id));
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.password) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const newUser: User = {
      id: formData.id,
      name: formData.name,
      password: formData.password,
      role: 'user',
      isActive: true,
      validUntil: formData.validUntil
    };

    try {
      await setDoc(doc(db, "users", formData.id), newUser);
      setUsers([...users, newUser]);
      setIsModalOpen(false);
      setFormData({ id: "", name: "", password: "", validUntil: "2099-12-31" });
    } catch (err) {
      console.error(err);
      alert("사용자 생성 실패");
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>사용자 계정 관리</h1>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>+ 계정 추가</button>
      </div>

      <div className={styles.cardGrid}>
        {users.map(u => (
          <div key={u.id} className={styles.userCard}>
            <div className={styles.cardHeader}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{u.name} <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.admin : ''}`}>{u.role === 'admin' ? '관리자' : '영업사원'}</span></span>
                <span className={styles.userId}>ID: {u.id}</span>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.label}>사용 여부 (접속 허용)</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={u.isActive} 
                  onChange={() => handleToggleActive(u)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.label}>사용 기한</span>
              <input 
                type="date" 
                className={styles.dateInput}
                value={u.validUntil}
                onChange={(e) => handleDateChange(u.id, e.target.value)}
              />
            </div>

            <div className={styles.actions}>
              <button className={styles.resetBtn} onClick={() => handleResetPassword(u.id)}>비밀번호 초기화</button>
              <button className={styles.deleteBtn} onClick={() => handleDeleteUser(u.id)}>계정 삭제</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>새 계정 등록</h2>
            <form onSubmit={handleCreateUser}>
              <div className={styles.formGroup}>
                <label className={styles.label}>아이디</label>
                <input type="text" className={styles.inputField} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="영문/숫자 조합" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>이름</label>
                <input type="text" className={styles.inputField} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="홍길동" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>초기 비밀번호</label>
                <input type="text" className={styles.inputField} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="1234" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>사용 기한</label>
                <input type="date" className={styles.inputField} value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit" className={styles.submitBtn}>등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
