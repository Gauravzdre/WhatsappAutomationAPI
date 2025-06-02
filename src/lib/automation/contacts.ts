export interface Contact {
  id: string;
  chatId: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  tags: string[];
  segment: string;
  customFields: Record<string, any>;
  joinedAt: Date;
  lastActive: Date;
  messageCount: number;
  isBlocked: boolean;
  notes?: string;
}

export interface ContactSegment {
  id: string;
  name: string;
  description: string;
  conditions: {
    tags?: string[];
    joinedAfter?: Date;
    joinedBefore?: Date;
    messageCountMin?: number;
    messageCountMax?: number;
    lastActiveAfter?: Date;
    lastActiveBefore?: Date;
    customField?: {
      field: string;
      operator: 'equals' | 'contains' | 'greater' | 'less';
      value: any;
    };
  };
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactStats {
  totalContacts: number;
  activeContacts: number;
  newContacts: number;
  blockedContacts: number;
  segmentBreakdown: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

export class ContactManager {
  private contacts: Map<string, Contact> = new Map();
  private segments: Map<string, ContactSegment> = new Map();

  constructor() {
    this.initializeDefaultSegments();
  }

  private initializeDefaultSegments(): void {
    const defaultSegments: ContactSegment[] = [
      {
        id: 'new',
        name: 'New Users',
        description: 'Users who joined in the last 7 days',
        conditions: {
          joinedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        contactCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'active',
        name: 'Active Users',
        description: 'Users active in the last 24 hours',
        conditions: {
          lastActiveAfter: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        contactCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'engaged',
        name: 'Engaged Users',
        description: 'Users with 10+ messages',
        conditions: {
          messageCountMin: 10
        },
        contactCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'inactive',
        name: 'Inactive Users',
        description: 'Users inactive for 7+ days',
        conditions: {
          lastActiveBefore: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        contactCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultSegments.forEach(segment => {
      this.segments.set(segment.id, segment);
    });
  }

  // Contact management
  createContact(chatId: string, userId: string, name?: string): Contact {
    const contact: Contact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      userId,
      name,
      tags: [],
      segment: 'new',
      customFields: {},
      joinedAt: new Date(),
      lastActive: new Date(),
      messageCount: 0,
      isBlocked: false
    };

    this.contacts.set(chatId, contact);
    this.updateSegmentCounts();
    return contact;
  }

  getContact(chatId: string): Contact | undefined {
    return this.contacts.get(chatId);
  }

  updateContact(chatId: string, updates: Partial<Contact>): boolean {
    const contact = this.contacts.get(chatId);
    if (!contact) return false;

    Object.assign(contact, updates);
    this.updateSegmentCounts();
    return true;
  }

  addContactTag(chatId: string, tag: string): boolean {
    const contact = this.contacts.get(chatId);
    if (!contact) return false;

    if (!contact.tags.includes(tag)) {
      contact.tags.push(tag);
      this.updateSegmentCounts();
    }
    return true;
  }

  removeContactTag(chatId: string, tag: string): boolean {
    const contact = this.contacts.get(chatId);
    if (!contact) return false;

    const index = contact.tags.indexOf(tag);
    if (index > -1) {
      contact.tags.splice(index, 1);
      this.updateSegmentCounts();
    }
    return true;
  }

  incrementMessageCount(chatId: string): boolean {
    const contact = this.contacts.get(chatId);
    if (!contact) return false;

    contact.messageCount++;
    contact.lastActive = new Date();
    this.updateContactSegment(contact);
    return true;
  }

  blockContact(chatId: string): boolean {
    const contact = this.contacts.get(chatId);
    if (!contact) return false;

    contact.isBlocked = true;
    this.updateSegmentCounts();
    return true;
  }

  unblockContact(chatId: string): boolean {
    const contact = this.contacts.get(chatId);
    if (!contact) return false;

    contact.isBlocked = false;
    this.updateSegmentCounts();
    return true;
  }

  // Segment management
  createSegment(segment: Omit<ContactSegment, 'contactCount' | 'createdAt' | 'updatedAt'>): ContactSegment {
    const newSegment: ContactSegment = {
      ...segment,
      contactCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.segments.set(segment.id, newSegment);
    this.updateSegmentCounts();
    return newSegment;
  }

  getSegment(segmentId: string): ContactSegment | undefined {
    return this.segments.get(segmentId);
  }

  getAllSegments(): ContactSegment[] {
    return Array.from(this.segments.values());
  }

  updateSegment(segmentId: string, updates: Partial<ContactSegment>): boolean {
    const segment = this.segments.get(segmentId);
    if (!segment) return false;

    Object.assign(segment, updates, { updatedAt: new Date() });
    this.updateSegmentCounts();
    return true;
  }

  deleteSegment(segmentId: string): boolean {
    return this.segments.delete(segmentId);
  }

  getContactsInSegment(segmentId: string): Contact[] {
    const segment = this.segments.get(segmentId);
    if (!segment) return [];

    return Array.from(this.contacts.values()).filter(contact => 
      this.contactMatchesSegment(contact, segment)
    );
  }

  private contactMatchesSegment(contact: Contact, segment: ContactSegment): boolean {
    const { conditions } = segment;

    // Check tags
    if (conditions.tags && conditions.tags.length > 0) {
      const hasRequiredTag = conditions.tags.some(tag => contact.tags.includes(tag));
      if (!hasRequiredTag) return false;
    }

    // Check join date
    if (conditions.joinedAfter && contact.joinedAt < conditions.joinedAfter) {
      return false;
    }
    if (conditions.joinedBefore && contact.joinedAt > conditions.joinedBefore) {
      return false;
    }

    // Check message count
    if (conditions.messageCountMin && contact.messageCount < conditions.messageCountMin) {
      return false;
    }
    if (conditions.messageCountMax && contact.messageCount > conditions.messageCountMax) {
      return false;
    }

    // Check last active
    if (conditions.lastActiveAfter && contact.lastActive < conditions.lastActiveAfter) {
      return false;
    }
    if (conditions.lastActiveBefore && contact.lastActive > conditions.lastActiveBefore) {
      return false;
    }

    // Check custom field
    if (conditions.customField) {
      const { field, operator, value } = conditions.customField;
      const fieldValue = contact.customFields[field];

      switch (operator) {
        case 'equals':
          if (fieldValue !== value) return false;
          break;
        case 'contains':
          if (!String(fieldValue).includes(String(value))) return false;
          break;
        case 'greater':
          if (Number(fieldValue) <= Number(value)) return false;
          break;
        case 'less':
          if (Number(fieldValue) >= Number(value)) return false;
          break;
      }
    }

    return true;
  }

  private updateContactSegment(contact: Contact): void {
    // Find the best matching segment for this contact
    let bestSegment = 'new';
    let bestPriority = 0;

    const segmentPriorities = {
      'engaged': 4,
      'active': 3,
      'new': 2,
      'inactive': 1
    };

    for (const segment of Array.from(this.segments.values())) {
      if (this.contactMatchesSegment(contact, segment)) {
        const priority = segmentPriorities[segment.id as keyof typeof segmentPriorities] || 0;
        if (priority > bestPriority) {
          bestSegment = segment.id;
          bestPriority = priority;
        }
      }
    }

    contact.segment = bestSegment;
  }

  private updateSegmentCounts(): void {
    // Reset all counts
    for (const segment of Array.from(this.segments.values())) {
      segment.contactCount = 0;
    }

    // Count contacts in each segment
    for (const contact of Array.from(this.contacts.values())) {
      for (const segment of Array.from(this.segments.values())) {
        if (this.contactMatchesSegment(contact, segment)) {
          segment.contactCount++;
        }
      }
    }
  }

  // Analytics and stats
  getContactStats(): ContactStats {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let activeContacts = 0;
    let newContacts = 0;
    let blockedContacts = 0;

    const segmentCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();

    for (const contact of Array.from(this.contacts.values())) {
      // Count active contacts
      if (contact.lastActive > oneDayAgo) {
        activeContacts++;
      }

      // Count new contacts
      if (contact.joinedAt > oneWeekAgo) {
        newContacts++;
      }

      // Count blocked contacts
      if (contact.isBlocked) {
        blockedContacts++;
      }

      // Count segments
      segmentCounts.set(contact.segment, (segmentCounts.get(contact.segment) || 0) + 1);

      // Count tags
      contact.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }

    const totalContacts = this.contacts.size;

    // Create segment breakdown
    const segmentBreakdown = Array.from(segmentCounts.entries()).map(([segment, count]) => ({
      segment,
      count,
      percentage: totalContacts > 0 ? (count / totalContacts) * 100 : 0
    }));

    // Create top tags
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalContacts,
      activeContacts,
      newContacts,
      blockedContacts,
      segmentBreakdown,
      topTags
    };
  }

  searchContacts(query: string): Contact[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.contacts.values()).filter(contact => 
      contact.name?.toLowerCase().includes(lowerQuery) ||
      contact.email?.toLowerCase().includes(lowerQuery) ||
      contact.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      contact.notes?.toLowerCase().includes(lowerQuery)
    );
  }

  exportContacts(segmentId?: string): Contact[] {
    if (segmentId) {
      return this.getContactsInSegment(segmentId);
    }
    return Array.from(this.contacts.values());
  }

  importContacts(contacts: Partial<Contact>[]): { imported: number; errors: string[] } {
    let imported = 0;
    const errors: string[] = [];

    for (const contactData of contacts) {
      try {
        if (!contactData.chatId || !contactData.userId) {
          errors.push('Missing required fields: chatId and userId');
          continue;
        }

        const existingContact = this.contacts.get(contactData.chatId);
        if (existingContact) {
          // Update existing contact
          Object.assign(existingContact, contactData);
        } else {
          // Create new contact
          const contact: Contact = {
            id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            chatId: contactData.chatId,
            userId: contactData.userId,
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone,
            tags: contactData.tags || [],
            segment: contactData.segment || 'new',
            customFields: contactData.customFields || {},
            joinedAt: contactData.joinedAt || new Date(),
            lastActive: contactData.lastActive || new Date(),
            messageCount: contactData.messageCount || 0,
            isBlocked: contactData.isBlocked || false,
            notes: contactData.notes
          };

          this.contacts.set(contact.chatId, contact);
        }

        imported++;
      } catch (error) {
        errors.push(`Error importing contact: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    this.updateSegmentCounts();
    return { imported, errors };
  }
}

// Export singleton instance
export const contactManager = new ContactManager(); 