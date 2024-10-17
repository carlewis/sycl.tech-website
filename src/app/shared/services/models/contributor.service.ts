/*---------------------------------------------------------------------------------------------
 *
 *  Copyright (C) Codeplay Software Ltd.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *--------------------------------------------------------------------------------------------*/

import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ContributorModel, SocialModel } from '../../models/contributor.model';
import { JsonFeedService } from '../json-feed.service';
import { map, Observable } from 'rxjs';
import { FeedFilter } from '../../components/filter-result-layout/FilterableService';

@Injectable({
  providedIn: 'root'
})
export class ContributorService extends JsonFeedService {
  /**
   * Array of contributors that are considered 'VIPs'
   */
  readonly vips = ['ruyman', 'andrew', 'tom', 'rod', 'rob', 'tony', 'james', 'gordon'];

  /**
   * Constructor.
   */
  constructor() {
    super(environment.json_feed_base_url + '/contributors/')
  }

  /**
   * @inheritDoc
   */
  convertFeedItem<ContributorModel>(
    feedItem: any
  ): ContributorModel {
    return <ContributorModel> ContributorService.convertFeedItem(feedItem);
  }

  /**
   * @inheritDoc
   */
  all(
    limit: number | null = null,
    offset: number = 0,
    filters: FeedFilter[] = [],
  ): Observable<ContributorModel[]> {
    return super._all<ContributorModel>(limit, offset, filters).pipe(map((f => f.items)));
  }

  /**
   * Get a list of vips.
   */
  getVips(): Observable<ContributorModel[]> {
    return this.all().pipe(
      map((contributors) => {
        contributors = contributors.filter((contributor) => {
          return this.vips.includes(contributor.username) ? contributor : null;
        });

        return contributors.sort((a, b) => (a.name > b.name) ? 1 : -1);
      })
    )
  }

  /**
   * Deserialize a social.
   * @param socialUrl
   */
  static deserializeSocial(
    socialUrl: string
  ): SocialModel {
    const hostname = new URL(socialUrl).hostname.replace('www.', '');

    switch (hostname) {
      case 'twitter.com': {
        return {
          name: 'Twitter',
          tag: 'twitter',
          url: socialUrl
        }
      }
      case 'x.com': {
        return {
          name: 'X.com',
          tag: 'twitter',
          url: socialUrl
        }
      }
      case 'facebook.com': {
        return {
          name: 'Facebook',
          tag: 'facebook',
          url: socialUrl
        }
      }
      case 'linkedin.com': {
        return {
          name: 'LinkedIn',
          tag: 'linkedin',
          url: socialUrl
        }
      }
      case 'github.com': {
        return {
          name: 'GitHub',
          tag: 'github',
          url: socialUrl
        }
      }
      case 'stackoverflow.com': {
        return {
          name: 'StackOverflow',
          tag: 'stackoverflow',
          url: socialUrl
        }
      }
      default : {
        return {
          name: socialUrl,
          tag: 'unknown',
          url: socialUrl
        }
      }
    }
  }

  /**
   * Fetch a contributor by their username.
   * @param username
   */
  getContributorByUsername2(
    username: string
  ): Observable<ContributorModel> {
    return this.all().pipe(
      map((contributors) => {
        const contributor = contributors.find(template => template.username === username);
        return contributor ? contributor : ContributorService.getAnonymousContributor();
      })
    );
  }

  /**
   * Convert a feed item into a ContributorModel.
   * @param feedItem
   */
  static convertFeedItem(feedItem: any): ContributorModel {
    return {
      name: feedItem['name'],
      username: feedItem['_username'],
      bio: feedItem['_content_html'],
      avatar: feedItem['avatar'],
      date: new Date(feedItem['date_published']),
      links: (feedItem['_links'] ? feedItem['_links'].map(
        (url: string) => ContributorService.deserializeSocial(url)) : []),
      position: feedItem['_position'],
      affiliation: feedItem['_affiliation'],
      contribution_counts: {
        news: feedItem['_contribution_counts']['news'],
        videos: feedItem['_contribution_counts']['videos'],
        projects: feedItem['_contribution_counts']['projects'],
        researchPapers: feedItem['_contribution_counts']['research_papers'],
        events: feedItem['_contribution_counts']['events'],
      }
    }
  }

  /**
   * Return an anonymous contributor.
   */
  static getAnonymousContributor(): ContributorModel {
    return {
      name: 'Anonymous',
      username: 'anonymous',
      avatar: environment.json_feed_base_url + '/static/images/contributors/anonymous.webp',
      date: new Date(),
      links: [],
      position: '',
      affiliation: '',
      contribution_counts: {
        news: 0,
        videos: 0,
        projects: 0,
        researchPapers: 0,
        events: 0
      }
    }
  }
}
