
# TODO

## Today

## As

- gamecontroller: 
    - spash screen on death, display lives and come back to last level
    - ability to change level

- observer pattern?
    -> instead of this._world.addObject()... world subscribes to 'new_object' event type?
    -> publish / subscribe type of thing
        (not that useful since need world anyways) _observer.publish(new Message('new_object', new_object))
        _observer.publish(new Message('bgcolor', '#adasdsda'))
        _observer.publish(new Message('hero_dead', null))
        _observer.publish(new Message('force_camera', [x,y]))
        _observer.publish(new Message('shake_screen', null))
        ^^ problem: if created by object at 1/2 of engine, how can make sure destination can read before clear?

        _observer.subscribe(this._messageBuffer)
                                ^^ when objects gets killed, mark this buffer as dead.

        Message
            type:
            data:
        for(let obj of _observer.consume('new_object')){
            this.addWorld(obj.data);
        }

    -> would also allow to do level transitions, etc.
    -> can be implemented as an ESObserver?

## Bs

- HUD to display items, etc

## Cs

- load ogg same as image files

- More unit-testing.
    - Basic collision.

- ? Engine: objects in two categories: everywhere, and on-screen. Don't waste CPU on off-screen objects collisions.  

- Able to stretch to full-screen.

# Notes

Inspired by きよしの挑戦状, http://8bits.nukimi.com/cfk/.
きよしに触発: kiyoshi ni shokuhatsu
https://twitter.com/wo60000

kiyoshi_ni_shokuhatsu
