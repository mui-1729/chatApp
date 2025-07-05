"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>AI回答</h2>
            {/* 既存のメッセージ表示部分 */}
            <div
              style={{
                marginBottom: "1rem",
                height: "300px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
              }}
            >
              {messages.map((msg) => (
                <p key={msg.id} style={{ marginBottom: "0.5rem" }}>
                  💬 {msg.text}
                </p>
              ))}
            </div>

            {/* 既存の入力と送信部分 */}
            <div style={{ display: "flex" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="AIへのメッセージを入力"
                style={{
                  padding: "0.5rem",
                  marginRight: "0.5rem",
                  flexGrow: 1,
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                送信
              </button>
            </div>
          </div>
        );
      case "external":
        return (
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              外部情報
            </h2>
            <p>ここにAI回答の補足となる信頼性の高い外部情報が表示されます。</p>
            {/* 今後、外部検索API連携後にここに表示ロジックを追加 */}
          </div>
        );
      case "community":
        return (
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              コミュニティ
            </h2>
            <p>ユーザー同士のQ&Aや専門家監修情報が表示されます。</p>
            {/* 今後、コミュニティ機能実装後にここに表示ロジックを追加 */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        多角的学習補助AIチャットアプリ
      </h1>

      {/* タブ切り替え部分 */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #ccc",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={() => setActiveTab("ai")}
          style={{
            padding: "10px 20px",
            border: "none",
            backgroundColor: activeTab === "ai" ? "#e0e0e0" : "transparent",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: activeTab === "ai" ? "bold" : "normal",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            marginRight: "5px",
          }}
        >
          AI回答
        </button>
        <button
          onClick={() => setActiveTab("external")}
          style={{
            padding: "10px 20px",
            border: "none",
            backgroundColor:
              activeTab === "external" ? "#e0e0e0" : "transparent",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: activeTab === "external" ? "bold" : "normal",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            marginRight: "5px",
          }}
        >
          外部情報
        </button>
        <button
          onClick={() => setActiveTab("community")}
          style={{
            padding: "10px 20px",
            border: "none",
            backgroundColor:
              activeTab === "community" ? "#e0e0e0" : "transparent",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: activeTab === "community" ? "bold" : "normal",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          コミュニティ
        </button>
      </div>

      {/* タブコンテンツの表示 */}
      {renderTabContent()}
    </main>
  );
}
