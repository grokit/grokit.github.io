class Collisions {

    static isCollide(l, r) {
        let pts = [];
        pts.push([l.x, l.y]);
        pts.push([l.x + l.width, l.y]);
        pts.push([l.x, l.y + l.height]);
        pts.push([l.x + l.width, l.y + l.height]);

        for (let pt of pts) {
            if (pt[0] >= r.x && pt[0] <= (r.x + r.width) && pt[1] >= r.y && pt[1] <= (r.y + r.height)) return true
        }

        return false;
    }

    // Coordinates is from bottom-left corner of sprite. Right / up is positive.
    static collisionType(l, r) {
        if (r.x + r.width - r.vx <= l.x && r.y - r.vy < l.y + l.height) {
            return 'left';
        } else if (r.x - r.vx >= l.x + l.width && r.y - r.vy < l.y + l.height) {
            return 'right';
        } else if (r.y + r.height - r.vy < l.y + l.height / 2) {
            return 'under';
        } else if (r.y - r.vy >= l.y + l.height - r.height / 5) {
            return 'over';
        }

        // We sometimes want to wait for next frame where the collision type
        // is less ambiguous. In this case, two objects overlap, but we don't
        // declare a collision type.
        return 'none';
    }

    static collide(l, r, factory, newObjects) {
        if (l.traits.has('swimmable') && r.traits.has('velocity')) {
            if (r.vy >= 1.5) {
                r.vy = Math.min(1.5, r.vy);
            }

            if (r.vy <= -0.1) {
                r.vy = Math.max(-0.1, r.vy);
            }

            r.ttls.set('inWater', 1);
            r.ttls.set('onSurface', 1);
        }

        if (l.traits.has('block_red') && r.traits.has('hero')) {
            // In future: explode. Trigger fire then explosion to all flamables.
        }

        // || (l.traits.has('block_blue') && r.traits.has('block_blue'))) 
        // ^^ blocks next to each other are in collision?
        if (l.traits.has('block_blue') && r.traits.has('hero')) {
            l.traits.add('physical_interactions');
            l.traits.add('velocity');
            l.vx = l.vx || 0;
            l.vy = l.vy || 4;

            l.traits.add('pass_through');
        }

        if (l.traits.has('destroy_by_bottom_collision') && r.traits.has('hero')) {
            if (r.vy > 0.5) {
                if (Collisions.collisionType(l, r) == 'under') {
                    l.ttls.set('kill', 0);

                    for (let i = 1; i < 15; ++i) {
                        let brickFallout = factory.buildFromName("gfx/brick_fallout.png");
                        brickFallout.x = l.x + l.width * (i / 15);
                        brickFallout.y = l.y;
                        newObjects.add(brickFallout);
                    }
                }
            }
        }

        if (l.traits.has('collidable') && r.traits.has('physical_interactions')) {
            if (l.traits.has('surface') && !r.traits.has('pass_through')) {

                // We know two objects collide == overlap.
                // 
                // By removing last velocity, we know where the object was before
                // it collided.
                switch (Collisions.collisionType(l, r)) {
                    case 'left':
                        r.x = l.x - r.width - 1;
                        break;
                    case 'right':
                        r.x = l.x + l.width + 1;
                        break;
                    case 'over':
                        r.vy = 0;
                        r.y = l.y + l.height;

                        // Use > 1: if on a falling surface, want to give a grace
                        // period to jump.
                        r.ttls.set('onSurface', 12);
                        break;
                    case 'under':
                        r.y = l.y - r.height - 1;
                        r.vy = 0;
                        break;
                }
            }
        }

        if (l.traits.has('block_up') && r.traits.has('hero')) {
            if (Collisions.collisionType(l, r) == 'over') {
                r.vy = 25;
                r.ttls.set('noJump', 3);
                r.ttls.set('onSurface', 0);
            }
        }

        if (l.traits.has('block_right') && r.traits.has('hero')) {
            if (Collisions.collisionType(l, r) == 'right') {
                r.vx += 30;
                r.ttls.set('noMaxX', 10);
            }
        }

        if (l.traits.has('next_level') && r.traits.has('hero')) {
            r.ttls.set('kill', 0);
            let text = factory.buildFromName('text', {
                text: "You Won!",
                size: 175
            });
            text.x = r.x;
            text.y = screenHeight / 2;
            newObjects.add(text);

            for (let i = 0; i < 150; ++i) {
                let ball = factory.buildFromName("gfx/ball.png");
                ball.x = r.x + 0.25 * screenWidth * (i / 1500);
                ball.y = screenHeight / 2;
                newObjects.add(ball);
            }

            // hack hack hack
            factory.end = true;
        }

    } // endof: collide function
}
