import axios from 'axios';

export interface ChatworkMessage {
  body: string;
  self_unread?: boolean;
}

export class ChatworkClient {
  private apiToken: string;
  private baseUrl = 'https://api.chatwork.com/v2';

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  /**
   * チャットワークにメッセージを送信
   * @param roomId ルームID
   * @param message メッセージ内容
   */
  async sendMessage(roomId: string, message: string): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rooms/${roomId}/messages`,
        new URLSearchParams({
          body: message,
        }),
        {
          headers: {
            'X-ChatWorkToken': this.apiToken,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(`Chatwork API error: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Chatwork send message error:', error);
      throw new Error(`Failed to send message to Chatwork: ${error.message}`);
    }
  }

  /**
   * レポートをフォーマットしてチャットワークに送信
   */
  formatReportMessage(report: {
    platform: string;
    accountName: string;
    dateRange: { start: string; end: string };
    summary: string;
    metrics: any;
    insights?: any[];
    recommendations?: any[];
  }): string {
    const lines: string[] = [];

    lines.push(`[info]`);
    lines.push(`[title]${report.platform === 'meta' ? 'Meta' : 'Google'}広告分析レポート`);
    lines.push(`アカウント: ${report.accountName}`);
    lines.push(`期間: ${report.dateRange.start} ～ ${report.dateRange.end}`);
    lines.push(`[/title]`);
    lines.push(``);

    // サマリー
    lines.push(`[title]📊 サマリー[/title]`);
    lines.push(report.summary);
    lines.push(``);

    // メトリクス
    if (report.metrics) {
      lines.push(`[title]📈 主要メトリクス[/title]`);
      const metrics = report.metrics;
      
      if (report.platform === 'meta') {
        lines.push(`インプレッション: ${metrics.impressions?.toLocaleString() || 0}`);
        lines.push(`クリック数: ${metrics.clicks?.toLocaleString() || 0}`);
        lines.push(`費用: ¥${parseFloat(metrics.spend || 0).toLocaleString()}`);
        lines.push(`CTR: ${parseFloat(metrics.ctr || 0).toFixed(2)}%`);
        lines.push(`CPC: ¥${parseFloat(metrics.cpc || 0).toFixed(2)}`);
        if (metrics.conversions) {
          lines.push(`コンバージョン数: ${metrics.conversions}`);
          lines.push(`コンバージョン単価: ¥${parseFloat(metrics.cost_per_conversion || 0).toFixed(2)}`);
        }
      } else {
        lines.push(`インプレッション: ${metrics.impressions?.toLocaleString() || 0}`);
        lines.push(`クリック数: ${metrics.clicks?.toLocaleString() || 0}`);
        lines.push(`費用: ¥${(parseInt(metrics.costMicros || 0) / 1000000).toLocaleString()}`);
        lines.push(`CTR: ${parseFloat(metrics.ctr || 0).toFixed(2)}%`);
        lines.push(`平均CPC: ¥${parseFloat(metrics.averageCpc || 0).toFixed(2)}`);
        if (metrics.conversions) {
          lines.push(`コンバージョン数: ${metrics.conversions}`);
          lines.push(`コンバージョン単価: ¥${parseFloat(metrics.costPerConversion || 0).toFixed(2)}`);
        }
      }
      lines.push(``);
    }

    // インサイト
    if (report.insights && report.insights.length > 0) {
      lines.push(`[title]💡 インサイト[/title]`);
      report.insights.forEach((insight, index) => {
        lines.push(`${index + 1}. ${insight}`);
      });
      lines.push(``);
    }

    // 推奨事項
    if (report.recommendations && report.recommendations.length > 0) {
      lines.push(`[title]✅ 推奨事項[/title]`);
      report.recommendations.forEach((rec, index) => {
        lines.push(`${index + 1}. ${rec}`);
      });
      lines.push(``);
    }

    lines.push(`[/info]`);

    return lines.join('\n');
  }

  /**
   * レポートをチャットワークに送信
   */
  async sendReport(
    roomId: string,
    report: {
      platform: string;
      accountName: string;
      dateRange: { start: string; end: string };
      summary: string;
      metrics: any;
      insights?: any[];
      recommendations?: any[];
    }
  ): Promise<void> {
    const message = this.formatReportMessage(report);
    await this.sendMessage(roomId, message);
  }
}