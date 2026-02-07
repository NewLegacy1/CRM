-- Make campaign_id unique so we can upsert by it when syncing from Meta/Google APIs
alter table public.agency_ads
  add constraint agency_ads_campaign_id_unique unique (campaign_id);
