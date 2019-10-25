// @ts-ignore
import urlParseLax from 'url-parse-lax';
import { IBrowsingChannelManager } from '@/interfaces/IBrowsingChannelManager';

type channelInfo = {
  channels: channelDetails[],
  availableChannels: string[],
}

type channelDetails = {
  channel: string,
  url: string,
  icon: string,
  title: string,
  path: string,
}

type category = {
  type: string,
  locale: string,
}

class BrowsingChannelManager implements IBrowsingChannelManager {
  private allChannels: Map<string, channelInfo>;

  private allCategories: category[];

  private allAvailableChannels: string[];


  public constructor() {
    this.allCategories = [
      { type: 'customized', locale: 'browsing.customized' },
      { type: 'general', locale: 'browsing.general' },
      { type: 'education', locale: 'browsing.education' },
    ];
    this.allChannels = new Map();
    this.allCategories.forEach((category: category) => {
      this.allChannels.set(category.type, { channels: [], availableChannels: [] });
    });
    this.allAvailableChannels = ['bilibili.com', 'iqiyi.com', 'douyu.com'];

    // 初始化默认添加的频道
    const generalChannels = [
      'https://www.bilibili.com/',
      'https://www.iqiyi.com/',
      'https://www.douyu.com/',
      'https://www.huya.com/',
      'https://v.qq.com/',
      'https://www.youku.com/',
      'https://www.twitch.tv/',
      'https://www.youtube.com/',
      'https://sports.qq.com/',
    ];
    this.allChannels.set('general', {
      channels: generalChannels.map((channel: string) => {
        let basename = '';
        const host = urlParseLax(channel).hostname;
        if (host.includes('sports.qq.com')) {
          basename = 'sportsqq';
        } else {
          basename = channel.slice(channel.indexOf('.') + 1, channel.lastIndexOf('.'));
        }
        const tld = channel.slice(channel.lastIndexOf('.'), channel.length - 1);
        const path = host.includes('www') ? `${basename}${tld}` : host;
        return {
          channel: `${basename}.com`,
          url: channel,
          icon: `${basename}Sidebar`,
          title: `browsing.${basename}`,
          path,
        };
      }),
      availableChannels: this.allAvailableChannels,
    });

    const educationalChannels = [
      'https://www.coursera.org/',
      'https://www.ted.com/',
      'https://www.lynda.com/',
      'https://www.masterclass.com/',
      'https://developer.apple.com/videos/wwdc2019/',
    ];
    this.allChannels.set('education', {
      channels: educationalChannels.map((channel: string) => {
        const host = urlParseLax(channel).hostname;
        const basename = channel.slice(channel.indexOf('.') + 1, channel.lastIndexOf('.'));
        const tld = channel.slice(channel.lastIndexOf('.'), channel.length - 1);
        const path = host.includes('www') ? `${basename}${tld}` : host;
        return {
          channel: `${basename}.com`,
          url: channel,
          icon: `${basename}Sidebar`,
          title: `browsing.${basename}`,
          path,
        };
      }),
      availableChannels: this.allAvailableChannels,
    });
  }

  public getAllCategories(): category[] {
    return this.allCategories;
  }

  public getAllChannels(): Map<string, channelInfo> {
    return this.allChannels;
  }

  public getChannelInfoByCategory(category: string): channelInfo {
    return this.allChannels.get(category) as channelInfo;
  }

  public setChannelAvailable(channel: string, available: boolean): void {
    if (available) {
      if (!this.allAvailableChannels.includes(channel)) {
        this.allAvailableChannels.push(channel);
      }
    } else {
      this.allAvailableChannels = this.allAvailableChannels
        .filter((aChannel: string) => aChannel !== channel);
    }
    this.allChannels.forEach((i: channelInfo) => {
      const allItems = i.channels.map((item: channelDetails) => item.channel);
      const available: string[] = [];
      this.allAvailableChannels.forEach((channel: string) => {
        if (allItems.includes(channel)) available.push(channel);
      });
      i.availableChannels = available;
    });
  }

  public getAllAvailableChannels(): channelDetails[] {
    const allChannels: channelDetails[] = [];
    const result: channelDetails[] = [];
    this.allCategories.forEach((item: category) => {
      allChannels.push(...this.getChannelInfoByCategory(item.type).channels);
    });
    this.allAvailableChannels.forEach((i: string) => {
      result.push(allChannels.filter((item: channelDetails) => item.channel === i)[0]);
    });
    return result;
  }

  public repositionChannels(from: number, to: number): channelDetails[] {
    const item = this.allAvailableChannels.splice(from, 1)[0];
    this.allAvailableChannels.splice(to, 0, item);
    return this.getAllAvailableChannels();
  }

  public initAvailableChannels(channels: channelDetails[]): channelDetails[] {
    this.allAvailableChannels = channels.map((i: channelDetails) => i.channel);
    this.allChannels.forEach((i: channelInfo) => {
      const allItems = i.channels.map((item: channelDetails) => item.channel);
      const available: string[] = [];
      this.allAvailableChannels.forEach((channel: string) => {
        if (allItems.includes(channel)) available.push(channel);
      });
      i.availableChannels = available;
    });
    return this.getAllAvailableChannels();
  }
}

export default new BrowsingChannelManager();
