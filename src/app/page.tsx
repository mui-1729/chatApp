"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import styles from "./page.module.css";
type Message = {
  id: string;
  text: string;
  created_at: string;
};

// タブの種類を定義
type Tab = "ai" | "external" | "community";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  // 新しくタブの状態管理を追加
  const [activeTab, setActiveTab] = useState<Tab>("ai"); // デフォルトはAI回答タブ

  // メッセージ一覧を取得
  useEffect(() => {
    // AIタブが選択されている時のみメッセージを取得する
    // 将来的にはタブに応じて異なるデータを取得するように変更します
    if (activeTab === "ai") {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from("messages")
          .select()
          .order("created_at", { ascending: true });
        if (!error && data) {
          setMessages(data);
        }
      };
      fetchMessages();
    }
  }, [activeTab]); // activeTabが変わるたびにメッセージを再取得

  // メッセージを送信（insert）
  const handleSend = async () => {
    if (!input.trim()) return;
    const { error } = await supabase
      .from("messages")
      .insert({ text: input })
      .select();
    if (!error) {
      setInput("");
      // 即時更新用（簡易リロード）
      // メッセージ送信後もAIタブのメッセージを更新
      const { data } = await supabase
        .from("messages")
        .select()
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
    } else {
      console.error("送信失敗:", error);
    }
  };

  // タブに応じたコンテンツをレンダリングする関数
  const renderTabContent = () => {
    switch (activeTab) {
      case "ai":
        return (
          <div>
            <h2 className={styles.tabContentTitle}>AI回答</h2>
            {/* 既存のメッセージ表示部分 */}
            <div className={styles.messageDisplay}>
              {messages.map((msg) => (
                <p key={msg.id} className={styles.messageItem}>
                  💬 {msg.text}
                </p>
              ))}
            </div>

            {/* 既存の入力と送信部分 */}
            <div className={styles.inputContainer}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="AIへのメッセージを入力"
                className={styles.messageInput}
              />
              <button onClick={handleSend} className={styles.sendButton}>
                送信
              </button>
            </div>
          </div>
        );
      case "external":
        return (
          <div>
            <h2 className={styles.tabContentTitle}>外部情報</h2>
            <p>ここにAI回答の補足となる信頼性の高い外部情報が表示されます。</p>
            {/* 今後、外部検索API連携後にここに表示ロジックを追加 */}
          </div>
        );
      case "community":
        return (
          <div>
            <h2 className={styles.tabContentTitle}>コミュニティ</h2>
            <p>ユーザー同士のQ&Aや専門家監修情報が表示されます。</p>
            {/* 今後、コミュニティ機能実装後にここに表示ロジックを追加 */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>多角的学習補助AIチャットアプリ</h1>

      {/* タブ切り替え部分 */}
      <div className={styles.tabContainer}>
        <button
          onClick={() => setActiveTab("ai")}
          className={`${styles.tabButton} ${
            activeTab === "ai" ? styles.tabButtonActive : ""
          }`}
        >
          AI回答
        </button>
        <button
          onClick={() => setActiveTab("external")}
          className={`${styles.tabButton} ${
            activeTab === "external" ? styles.tabButtonActive : ""
          }`}
        >
          外部情報
        </button>
        <button
          onClick={() => setActiveTab("community")}
          className={`${styles.tabButton} ${
            activeTab === "community" ? styles.tabButtonActive : ""
          }`}
        >
          コミュニティ
        </button>
      </div>

      {/* タブコンテンツの表示 */}
      {renderTabContent()}
    </main>
  );
}
