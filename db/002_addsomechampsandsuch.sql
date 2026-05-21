--insert some data for testing purposes
INSERT INTO heroes (
    hero_key,
    display_name,
    role,
    subrole,
    pickrate,
    winrate,
    health,
    armor,
    shields,
    portrait_url,
    description
) VALUES
(
    'winston',
    'Winston',
    'tank',
    'initiator',
    6.1,
    50.7,
    425,
    200,
    0,
    'https://d15f34w2p8l1cc.cloudfront.net/overwatch/46a10db3aa908c590ddc4e7606376a88143d1f1306ecfbea043263040f9529a5.png',
    'A super-intelligent, genetically engineered gorilla, Winston is a brilliant scientist and a champion for humanity’s potential.'
),
(
    'tracer',
    'Tracer',
    'damage',
    'flanker',
    6.1,
    51.1,
    175,
    0,
    0,
    'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4504f6f15cb3feaa92ecd38e01dcf751cb5abdac2e0bb52d0555727e53277502.png',
    'The former Overwatch agent known as Tracer is a time-jumping adventurer and an irrepressible force for good.'
)
ON CONFLICT (hero_key) DO NOTHING;

INSERT INTO users (username, password_hash)
VALUES ('WintonFan123', 'hashed_password_123')
ON CONFLICT (username) DO NOTHING;

INSERT INTO team_comps (
    user_id,
    name,
    hero_1,
    hero_2,
    hero_3,
    hero_4,
    hero_5
) VALUES (
    1,
    'Test Dive Comp',
    'winston',
    'tracer',
    'tracer',
    'winston',
    'tracer'
);