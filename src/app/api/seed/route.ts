import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
export async function POST(){ if(store.plays.length) return NextResponse.json({data:'already'}); store.plays.push({id:crypto.randomUUID(),name:'Trips Right Mesh',tags:['3rd_down'],situation:'general',canvasData:[],updatedAt:new Date().toISOString()}); return NextResponse.json({data:'seeded'}); }
