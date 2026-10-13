/** Player-facing distance; it is not a count of draws or completed groups. */
export const listeningDistance = (shanten: number): string => shanten < 0 ? '胡牌牌型已湊齊'
  : shanten === 0 ? '聽牌' : `至少再 ${shanten} 次有效進牌可聽牌`;
