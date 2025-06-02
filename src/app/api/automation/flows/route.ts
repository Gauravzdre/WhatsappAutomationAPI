import { NextRequest, NextResponse } from 'next/server';
import { automationEngine } from '@/lib/automation/engine';
import { contactManager } from '@/lib/automation/contacts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        // Get automation and contact statistics
        const flowStats = automationEngine.getFlowStats();
        const userStats = automationEngine.getUserStats();
        const contactStats = contactManager.getContactStats();

        return NextResponse.json({
          success: true,
          data: {
            flows: flowStats,
            users: userStats,
            contacts: contactStats,
            timestamp: new Date().toISOString()
          }
        });

      case 'flows':
        // Get all automation flows
        const flows = automationEngine.getAllFlows();
        return NextResponse.json({
          success: true,
          data: {
            flows: flows.map(flow => ({
              id: flow.id,
              name: flow.name,
              description: flow.description,
              active: flow.active,
              stats: flow.stats,
              triggerCount: flow.triggers.length,
              actionCount: flow.actions.length,
              createdAt: flow.createdAt,
              updatedAt: flow.updatedAt
            }))
          }
        });

      case 'contacts':
        // Get contact information
        const segment = searchParams.get('segment');
        const search = searchParams.get('search');
        
        let contacts;
        if (search) {
          contacts = contactManager.searchContacts(search);
        } else if (segment) {
          contacts = contactManager.getContactsInSegment(segment);
        } else {
          contacts = contactManager.exportContacts();
        }

        return NextResponse.json({
          success: true,
          data: {
            contacts: contacts.slice(0, 100), // Limit to 100 for performance
            total: contacts.length,
            segments: contactManager.getAllSegments()
          }
        });

      case 'segments':
        // Get all contact segments
        const segments = contactManager.getAllSegments();
        return NextResponse.json({
          success: true,
          data: { segments }
        });

      default:
        // Default: return overview
        return NextResponse.json({
          success: true,
          data: {
            overview: {
              flows: automationEngine.getAllFlows().length,
              activeFlows: automationEngine.getAllFlows().filter(f => f.active).length,
              totalContacts: contactManager.getContactStats().totalContacts,
              activeContacts: contactManager.getContactStats().activeContacts,
              newContacts: contactManager.getContactStats().newContacts
            },
            recentActivity: {
              flowStats: automationEngine.getFlowStats().slice(0, 5),
              userStats: automationEngine.getUserStats()
            }
          }
        });
    }
  } catch (error) {
    console.error('❌ Automation API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_flow':
        // Create new automation flow
        if (!data.id || !data.name || !data.triggers || !data.actions) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: id, name, triggers, actions'
          }, { status: 400 });
        }

        const newFlow = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          triggers: data.triggers,
          actions: data.actions,
          active: data.active !== false,
          createdAt: new Date(),
          updatedAt: new Date(),
          stats: { triggered: 0, completed: 0 }
        };

        automationEngine.addFlow(newFlow);

        return NextResponse.json({
          success: true,
          data: { flow: newFlow }
        });

      case 'update_flow':
        // Update existing automation flow
        if (!data.id) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field: id'
          }, { status: 400 });
        }

        const updated = automationEngine.updateFlow(data.id, {
          name: data.name,
          description: data.description,
          triggers: data.triggers,
          actions: data.actions,
          active: data.active
        });

        if (!updated) {
          return NextResponse.json({
            success: false,
            error: 'Flow not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: { updated: true }
        });

      case 'toggle_flow':
        // Toggle flow active status
        if (!data.id) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field: id'
          }, { status: 400 });
        }

        const flow = automationEngine.getFlow(data.id);
        if (!flow) {
          return NextResponse.json({
            success: false,
            error: 'Flow not found'
          }, { status: 404 });
        }

        const toggled = automationEngine.updateFlow(data.id, {
          active: !flow.active
        });

        return NextResponse.json({
          success: true,
          data: { 
            flowId: data.id,
            active: !flow.active,
            updated: toggled
          }
        });

      case 'delete_flow':
        // Delete automation flow
        if (!data.id) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field: id'
          }, { status: 400 });
        }

        const deleted = automationEngine.deleteFlow(data.id);

        return NextResponse.json({
          success: true,
          data: { deleted }
        });

      case 'create_segment':
        // Create new contact segment
        if (!data.id || !data.name || !data.conditions) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: id, name, conditions'
          }, { status: 400 });
        }

        const newSegment = contactManager.createSegment({
          id: data.id,
          name: data.name,
          description: data.description || '',
          conditions: data.conditions
        });

        return NextResponse.json({
          success: true,
          data: { segment: newSegment }
        });

      case 'update_contact':
        // Update contact information
        if (!data.chatId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field: chatId'
          }, { status: 400 });
        }

        const contactUpdated = contactManager.updateContact(data.chatId, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
          customFields: data.customFields
        });

        if (!contactUpdated) {
          return NextResponse.json({
            success: false,
            error: 'Contact not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: { updated: true }
        });

      case 'add_contact_tag':
        // Add tag to contact
        if (!data.chatId || !data.tag) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: chatId, tag'
          }, { status: 400 });
        }

        const tagAdded = contactManager.addContactTag(data.chatId, data.tag);

        return NextResponse.json({
          success: true,
          data: { added: tagAdded }
        });

      case 'remove_contact_tag':
        // Remove tag from contact
        if (!data.chatId || !data.tag) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: chatId, tag'
          }, { status: 400 });
        }

        const tagRemoved = contactManager.removeContactTag(data.chatId, data.tag);

        return NextResponse.json({
          success: true,
          data: { removed: tagRemoved }
        });

      case 'block_contact':
        // Block contact
        if (!data.chatId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required field: chatId'
          }, { status: 400 });
        }

        const blocked = contactManager.blockContact(data.chatId);

        return NextResponse.json({
          success: true,
          data: { blocked }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Automation API POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 